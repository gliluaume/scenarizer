import {
  assertEquals,
  assertObjectMatch,
} from "https://deno.land/std@0.99.0/testing/asserts.ts";
import {
  cloneDeep,
  merge,
  pick,
} from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { Context } from "./Context.ts";
import { applyMacros, KvList } from "./macros.ts";
import { C, methodsColors } from "./formatting.ts";
import { applyMatchers, searchForMatchers } from "./matchers.ts";

export class Action {
  public handler: ActionFnWithContext;
  public payload: any;
  public get name() {
    return this.handler.name;
  }

  constructor(data: any) {
    if (Object.keys(data).length !== 1) {
      throw new Error("Only one key expected");
    }

    const name = Object.keys(data)[0];
    if (!actions.has(name)) throw new Error(`Unknown action ${name}`);

    this.handler = actions.get(name) as ActionFnWithContext;
    this.payload = data[name];
  }
}

export type ActionFnWithContext = (
  context: Context,
  payload: Action
) => Promise<ActionResponse>;

export type ActionFn = (payload: Object) => Object;

export interface ActionResponse {
  context?: Context;
  result?: any;
}

export const actions: Map<string, ActionFnWithContext> = new Map([
  ["request", request],
  ["updateContext", updateContext],
]);

async function request(
  context: Context,
  action: Action
): Promise<ActionResponse> {
  const actionTitle = requestActionTitle(action);
  try {
    const response = await _request(context, action);
    console.log("✔️ " + actionTitle);
    return response;
  } catch (e) {
    console.log("❌ " + actionTitle);
    console.log(e.message);
    return { result: false, context };
    // throw e;
  }
}

async function _request(
  context: Context,
  action: Action
): Promise<ActionResponse> {
  const { endpoint, ...config } = action.payload;
  const headers = new Headers(context.persistentHeaders);
  if (config.headers) {
    Object.keys(config.headers).forEach((name) => {
      headers.append(name, config.headers[name]);
    });
  }
  const method = config.method.toLocaleUpperCase();
  const init: RequestInit = { headers, method };

  if (config.body) {
    const bodyStr =
      typeof config.body === "string"
        ? config.body
        : JSON.stringify(config.body);
    init.body = new Blob([bodyStr], {
      type: "application/json",
    });
  }

  const fullUrl = buildUrl(context.baseUrl!, endpoint, config.query);

  const response = await fetch(fullUrl, init);

  // Check status
  const wrappedStatus = config?.expect?.status || 200;

  if (response.status !== wrappedStatus) {
    assertEquals(
      response.status,
      wrappedStatus,
      formatStatusError(endpoint, response.status, wrappedStatus)
    );
  }

  // Check headers
  if (config?.expect?.headers) {
    for (let [k, v] of Object.entries(config.expect.headers)) {
      const actual = response.headers.get(k) as string;
      const expected = (v as object).toString();
      assertEquals(actual, expected, formatHeaderError(k, actual, expected));
    }
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  // Check body
  if (config?.expect?.body) {
    const expectedBody = isJson
      ? JSON.parse(config.expect.body)
      : config.expect.body;

    assertBody(body, expectedBody, config?.expect?.settings?.bodyMatch);
  }

  const result = merge(pick(response, "status"), { body });

  return { result, context };
}

// TODO: export assert function to a dedicated module: assertStatus, assertHeader, assertBody
export const assertBody = (actual: any, expected: any, bodyMatch: boolean) => {
  const matchers = searchForMatchers(expected);
  const alteredExpected =
    matchers.length > 0 ? applyMatchers(actual, expected, matchers) : expected;

  bodyMatch
    ? assertObjectMatch(actual, alteredExpected)
    : assertEquals(actual, alteredExpected);
};

const formatScalarError = (
  heading: string,
  endpoint: string,
  actual: string | number,
  expected: string | number
) => {
  return (
    `${heading} ${C.bold}${endpoint}${C.reset}: ` +
    `(actual) ${C.bold}${C.red}${actual}${C.reset} != ` +
    `${C.bold}${C.green}${expected}${C.reset} (expected)`
  );
};
const formatStatusError = formatScalarError.bind(null, "status");
const formatHeaderError = formatScalarError.bind(null, "header");

const buildUrl = (baseUrl: string, endpoint: string, query: KvList) => {
  const url = new URL(endpoint, baseUrl);
  if (query) {
    for (let [k, v] of Object.entries(query)) {
      url.searchParams.append(k, v as string);
    }
  }
  return url.toString();
};

const requestActionTitle = (action: Action) => {
  const method = action?.payload?.method!;
  const methodText = methodsColors.has(method)
    ? `${methodsColors.get(method)}${method}${C.reset}`
    : method || "";

  return action.name === "request"
    ? `${action.name} ${methodText} ${action?.payload?.endpoint}`
    : action.name;
};

// deno-lint-ignore require-await
async function updateContext(
  context: Context,
  action: Action
  // data: KvList
): Promise<ActionResponse> {
  const actionTitle = `${action.name}: ${Object.keys(action?.payload).join()}`;
  console.log(actionTitle);
  const data = action.payload;
  const forbidden = ["history"];
  const unauthorized = Object.keys(data).filter((key) =>
    forbidden.includes(key)
  );
  if (unauthorized.length > 0) {
    throw new Error(
      `Can not update context value(s) ${unauthorized.join(", ")}`
    );
  }

  const toMerge = applyMacros(data, context);
  const contextCpy = cloneDeep(context);

  return { result: true, context: merge(contextCpy, toMerge) };
}
