import {
  cloneDeep,
  get,
  set,
} from "https://deno.land/x/lodash@4.17.15-es/lodash.js";

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
 */
type matcherParam = string | number;

export type matcher = (...values: matcherParam[]) => boolean;

const noop = () => true;
const matchNumber = (candidate: string, min?: number, max?: number) => {
  if (Number.isNaN(+candidate)) return false;
  const val = +candidate;
  if (null !== min && null !== max) return val >= min! && val <= max!;
  if (null !== min) return val >= min!;
  return true;
};

type matcherNames =
  | "§match.closeDate"
  | "§match.date"
  | "§match.number"
  | "§match.regexp"
  | "§match.uuid";

export const matchers: Map<matcherNames, matcher> = new Map([
  ["§match.closeDate", noop],
  ["§match.date", noop],
  ["§match.number", matchNumber as matcher],
  ["§match.regexp", noop],
  ["§match.uuid", noop],
]);

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
    const executor = matchers.get(this.matcherName)!;
    return executor(candidate, ...this.params);
  }
}

export function searchForMatchers(
  data: any,
  path: string[] = [],
  descriptors: MatcherDescriptor[] = []
): MatcherDescriptor[] {
  if (typeof data === "object") {
    for (const key in data) {
      searchForMatchers(data[key], [...path, key], descriptors);
    }
    return descriptors;
  } else if (typeof data === "string") {
    const matcherDesc =
      [...matchers.keys()]
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
          matcherDesc.path
        )
      );
    }
    return descriptors;
  } else {
    return descriptors;
  }
}

type paramExtractorFn = (strPrm: string) => matcherParam[];
const extractNumbers: paramExtractorFn = (strPrm?: string) =>
  strPrm ? strPrm.split(" ").map((p) => +p) : [];
const extractSingleString: paramExtractorFn = (strPrm: string) => [strPrm];
const extractNoParam: paramExtractorFn = (_strPrm: string) => [];

const paramExtractor: Map<matcherNames, paramExtractorFn> = new Map([
  ["§match.closeDate", extractNumbers],
  ["§match.date", extractNoParam],
  ["§match.number", extractNumbers],
  ["§match.regexp", extractSingleString],
  ["§match.uuid", extractNoParam],
]);

export const subSearch = (
  matcherName: matcherNames,
  candidate: string
): matcherParam[] | false => {
  const regexp = new RegExp(`${matcherName} ?(?<params>.*)?`);
  const match = regexp.exec(candidate);
  return !match
    ? false
    : paramExtractor.has(matcherName)
    ? paramExtractor.get(matcherName)!(match?.groups?.params!)
    : [];
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
  matchers: MatcherDescriptor[]
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
