import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import {
  cloneDeep,
  merge,
  pick,
} from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { Context } from "./Context.ts";
import { applyMacros, KvList } from "./macros.ts";
import { C } from "./formatting.ts";

export type ActionFnWithContext = (
  context: Context,
  payload: any
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
  { endpoint, ...config }: any
): Promise<ActionResponse> {
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
      typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
    init.body = new Blob([bodyStr], {
      type: "application/json",
    });
  }

  const fullUrl = buildUrl(context.baseUrl, endpoint, config.query);

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
      const actual = response.headers.get(k);
      const expected = v.toString();
      assertEquals(
        actual,
        expected,
        formatHeaderError(k, actual, expected)
      );
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
    assertEquals(body, expectedBody);
  }

  const result = merge(pick(response, "status"), { body });

  return { result, context };
}

const formatScalarError = (heading, endpoint, actual, expected) => {
  return `${heading} ${C.bold}${endpoint}${C.reset}: `+
  `(actual) ${C.bold}${C.red}${actual}${C.reset} != `+
  `${C.bold}${C.green}${expected}${C.reset} (expected)`;
}
const formatStatusError = formatScalarError.bind(null, 'status')
const formatHeaderError = formatScalarError.bind(null, 'header')

const buildUrl = (baseUrl, endpoint, query) => {
  const url = new URL(endpoint, baseUrl);
  if (query) {
    for (let [k, v] of Object.entries(query)) {
      url.searchParams.append(k, v);
    }
  }
  return url.toString();
}
// const asObject = (input: object | string) => {
//   if (typeof input === 'object') return input;
//   if (typeof input === 'string') return JSON.parse(input)
//   throw new Error("invalid input. Expected string or object");
// }

// deno-lint-ignore require-await
async function updateContext(
  context: Context,
  data: KvList
): Promise<ActionResponse> {
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

  return { context: merge(contextCpy, toMerge) };
}
