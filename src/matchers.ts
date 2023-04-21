import {
  cloneDeep,
  get,
  set,
} from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { tools } from "./tools.ts";
import isNil from "https://deno.land/x/lodash@4.17.15-es/isNil.js";
import { C } from "./formatting.ts";
import baseSet from "https://deno.land/x/lodash@4.17.15-es/_baseSet.js";

/**
 * A matcher is to be used in a body expectation.
 *
 * ```yaml
 *  cars-200:
 *  label: Home page
 *  actions:
 *    - request:
 *        endpoint: /api/cars
 *        query:
 *          brand: simca
 *        method: GET
 *        expect:
 *          settings:
 *            bodyMatch: true
 *          status: 200
 *          headers:
 *            x-paging-pages-total: 0
 *            x-paging-pages-current: 0
 *          body: |
 *            [
 *              {
 *                "id": 1000,
 *                "creationDate": "§match.closeDate"
 *              },
 *              {
 *                "id": 1002,
 *                "creationDate": "§match.closeDate 500"
 *              }
 *            ]
 * ```
 * for example, §match.closeDate will
 * 1. try to get value from path described in expected body
 * 2. check if actual value is a date to parse from ISO format YYYY-MM-DDTHH:MM:SS.sssZ
 * 3. compare date in actual with current date with 5 seconds delta by default, given ms otherwise
 *
 * To process, the first thing to implement could be
 * after having received a body data
 * find all the matched in expected body
 * check value in actual match the matcher rule
 * a find and replace in "new expected" the actual value
 * run object comparison as usual comparing newExpected with actual
 *
 * We will only implement matcher of "scalar" values (no complex objects, no array, etc.)
 * Proposition of matchers to implement (skip §match prefix):
 * - closeDate
 * - date: any date
 * - number [min] [max]: a number, a number >= min, a number <= max
 * - regexp [pattern]: a string, a string matchin a pattern
 * - uuid: any uuid, uuid/V4, guid, etc. could be a shorthand of a specific case of the previous one
 *
 * Matchers syntax must be checked in the whole input file.
 * On the current version, a valid location for matcher is:
 * - in the expect section
 * - in the expected body
 * - only when body is a valid JSON
 *
 * Further and easy locations:
 * - expected header
 * - expected body as string (should specify delimiter, eg {{§matcher.number 1 10}})
 */
type matcherParam = string | number;

type matchFn = (...values: matcherParam[]) => boolean;

const dateRegexp = /^[\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}([\d]{3})?/;

const closeDate = (str: string, offset = 500) => {
  if (offset < 0) throw Error("invalid offset for closeDate. Given:" + offset);
  const diff = tools.now().getTime() - new Date(str).getTime();
  return diff >= 0 && diff <= offset;
};
const matchNumber = (candidate: string, min?: number, max?: number) => {
  if (Number.isNaN(+candidate)) return false;
  const val = +candidate;
  if (!isNil(min) && !isNil(max)) return val >= min! && val <= max!;
  if (!isNil(min)) return val >= min!;
  return true;
};
const date = (candidate: string) => {
  if (!dateRegexp.exec(candidate)) return false;
  try {
    new Date(candidate);
    return true;
  } catch {
    return false;
  }
};
const regexp = (candidate: string, tpl: string) => {
  if (typeof tpl !== "string") throw new Error("invalid tpl for regexp");
  const r = new RegExp(tpl);
  return !!r.exec(candidate);
};
const uuid = (candidate: string) =>
  !!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .exec(
      candidate,
    );

type paramExtractorFn = (strPrm: string) => matcherParam[];
const extractNumbers: paramExtractorFn = (strPrm?: string) =>
  strPrm ? strPrm.split(" ").map((p) => +p) : [];
const extractSingleString: paramExtractorFn = (strPrm: string) => [strPrm];
const extractNoParam: paramExtractorFn = (_strPrm: string) => [];

const checkNumbers = (minNum = 0, maxNum = 0) => (text: string) => {
  const list = text.split(" ");
  const given = `Given \x1b[31m${text}\x1b[0m`;
  if (list.length > maxNum || list.length < minNum) {
    const suffix = maxNum !== minNum
      ? `${minNum} to ${maxNum} parameters.`
      : `exactly ${minNum} parameter${minNum > 1 ? "s" : ""}.`;

    return `Number params: Bad number of arguments. Expecting ${suffix} ${given}`;
  }
  const badParams = list.filter((prm) => Number.isNaN(Number(prm)));
  if (badParams.length > 0) {
    return `Number params: Bad param types, number expected, given: \x1b[31m${
      badParams.join(
        ", ",
      )
    }\x1b[0m`;
  }
  return false;
};

const checkDatePrm: syntaxChecker = (text: string) => {
  return text.length === 0
    ? false
    : checkNumbers(0, Number.MAX_VALUE)(text) + "(date)";
};
const checkNoParam: syntaxChecker = (text: string) => {
  return text.length === 0 ? false : "No param expected";
};
const checkExactlyOneStringParam: syntaxChecker = (text: string) => {
  return text.length !== 0 ? false : "Exactly one string param expected";
};

interface IErrorsItem {
  lineNumber: number;
  message: string;
}
type syntaxChecker = (line: string) => string | false;
export const checkSyntax = (lines: string[]) => {
  return lines.reduce((errs, line, index) => {
    const errorsSet = checkLineSyntax(line, index);
    if (errorsSet) {
      errs.push(errorsSet);
    }
    return errs;
  }, [] as IErrorsItem[]);
};

interface IErrorsSet {
  errors: IErrorsItem[];
  path: string[];
  body: string;
}

export const formatMatchersErrors = (errorsSet: IErrorsSet[]) => {
  return errorsSet
    .map(
      (set) =>
        `${C.bold}${set.path.join(".")}${C.reset}:\n` +
        set.errors
          .map(
            (error) =>
              `  ${C.bold}${error.lineNumber}${C.reset}: ${error.message}`,
          )
          .join("\n") +
        "\n" +
        getBodyContext(set),
    )
    .join("\n");
};

const getBodyContext = (set: IErrorsSet) => {
  const linesWithError = set.errors.map((err) => err.lineNumber);
  let bodyLinesColored = set.body.split("\n");
  const decimals = 1 + Math.floor(Math.log10(bodyLinesColored.length));
  const head = " ".repeat(4);
  bodyLinesColored = bodyLinesColored.map((line, index) => {
    const paddedLineNum = `${index + 1}`.padStart(decimals, " ");

    if (linesWithError.includes(index)) {
      return `${head}${C.red}${paddedLineNum}: ${line}${C.reset}`;
    }
    return `${head}${paddedLineNum}: ${line}`;
  });
  const start = Math.max(1, Math.min(...linesWithError) - 1);
  const end = Math.min(
    bodyLinesColored.length,
    Math.max(...linesWithError) + 1,
  );
  const scope = bodyLinesColored.slice(start - 1, end + 1);

  if (start > 1) scope.unshift("…");
  if (end < bodyLinesColored.length) scope.push("…");
  return scope.join("\n");
};

export const checkScenarioData = (data: any) => {
  const allErrors: IErrorsSet[] = [];
  Object.keys(data.steps).forEach((stepName) => {
    const actions = data.steps[stepName as any].actions;
    actions.forEach((action: any) => {
      const bodyText = action?.request?.expect?.body;
      if (bodyText) {
        const errors = checkSyntax(bodyText.split("\n"));
        if (errors.length > 0) {
          allErrors.push({
            errors,
            path: ["steps", stepName, "action", "request", "expect", "body"],
            body: bodyText,
          });
        }
      }
    });
  });
  return allErrors;
};

const checkLineSyntax = (
  line: string,
  lineNumber: number,
): IErrorsItem | false => {
  const m = /(?<matcher>§match\.[^ \"]+) ?(?<trailing>[^\"]*)/.exec(line);
  if (!m) return false;
  const name = m.groups?.matcher! as matcherNames;
  if (!Matchers.has(name)) {
    return {
      lineNumber,
      message: `unknown matcher "${name}"`,
    };
  }
  const trailing = m.groups?.trailing!;
  const isBad = Matchers.checker(name)(trailing);
  if (isBad) {
    return {
      lineNumber,
      message: isBad,
    };
  }
  return false;
};

class Matcher {
  checker: syntaxChecker;
  paramExtractor: paramExtractorFn;
  executor: matchFn;
  constructor(
    checker: syntaxChecker,
    paramExtractor: paramExtractorFn,
    executor: matchFn,
  ) {
    this.checker = checker;
    this.paramExtractor = paramExtractor;
    this.executor = executor;
  }
}

type matcherNames =
  | "§match.closeDate"
  | "§match.date"
  | "§match.number"
  | "§match.regexp"
  | "§match.uuid";

class _Matchers {
  private matchers: Map<matcherNames, Matcher>;
  constructor() {
    this.matchers = new Map([
      [
        "§match.closeDate",
        new Matcher(checkDatePrm, extractNumbers, closeDate as matchFn),
      ],
      [
        "§match.date",
        new Matcher(checkNoParam, extractNoParam, date as matchFn),
      ],
      [
        "§match.number",
        new Matcher(checkNumbers(0, 2), extractNumbers, matchNumber as matchFn),
      ],
      [
        "§match.regexp",
        new Matcher(
          checkExactlyOneStringParam,
          extractSingleString,
          regexp as unknown as matchFn,
        ),
      ],
      [
        "§match.uuid",
        new Matcher(checkNoParam, extractNoParam, uuid as matchFn),
      ],
    ]);
  }

  get list(): matcherNames[] {
    return [...this.matchers.keys()];
  }

  has(name: matcherNames): boolean {
    return this.matchers.has(name);
  }

  get(name: matcherNames): Matcher {
    if (!this.matchers.has(name)) throw new Error(`Unknown matcher ${name}!`);
    return this.matchers.get(name)!;
  }

  checker(name: matcherNames) {
    return this.get(name).checker;
  }

  executor(name: matcherNames) {
    return this.get(name).executor;
  }

  paramExtractor(name: matcherNames) {
    return this.get(name).paramExtractor;
  }
}

export const Matchers = new _Matchers();

/************************************************************************* */
export class MatcherDescriptor {
  matcherName: matcherNames;
  params: matcherParam[];
  path: string[];
  constructor(name: matcherNames, params: matcherParam[], path: string[]) {
    this.matcherName = name;
    this.params = params;
    this.path = path;
  }
  execute(candidate: matcherParam) {
    const executor = Matchers.executor(this.matcherName)!;
    return executor(candidate, ...this.params);
  }
}

export function searchForMatchers(
  data: any,
  path: string[] = [],
  descriptors: MatcherDescriptor[] = [],
): MatcherDescriptor[] {
  if (typeof data === "object") {
    for (const key in data) {
      searchForMatchers(data[key], [...path, key], descriptors);
    }
    return descriptors;
  } else if (typeof data === "string") {
    const matcherDesc = Matchers.list
      .map((matcherName) => {
        const params = subSearch(matcherName, data);
        return params ? { matcherName, params, path } : false;
      })
      .find((isMacroDesc) => isMacroDesc) || false;
    if (matcherDesc) {
      descriptors.push(
        new MatcherDescriptor(
          matcherDesc.matcherName,
          matcherDesc.params,
          matcherDesc.path,
        ),
      );
    }
    return descriptors;
  } else {
    return descriptors;
  }
}

export const subSearch = (
  matcherName: matcherNames,
  candidate: string,
): matcherParam[] | false => {
  const regexp = new RegExp(`${matcherName} ?(?<params>.*)?`);
  const match = regexp.exec(candidate);
  return !match
    ? false
    : Matchers.paramExtractor(matcherName)(match?.groups?.params!);
};

/**
 * Recalculate expected from matching values in actual data
 * @param actual object retrieven
 * @param expected object expected
 * @param matchers found matcher
 * @returns the expected body with values from actual where values match matchers
 * @throws assertion error when actual values do not match matchers
 */
export const applyMatchers = (
  actual: any,
  expected: any,
  matchers: MatcherDescriptor[],
): any => {
  const alteredExpected = cloneDeep(expected);

  matchers.forEach((matcher) => {
    const dottedPath = matcher.path.join(".");
    const valueUnderTest = get(actual, dottedPath);
    if (matcher.execute(valueUnderTest)) {
      set(alteredExpected, dottedPath, valueUnderTest);
    }
  });

  return alteredExpected;
};
