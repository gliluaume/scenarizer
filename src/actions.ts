import {
  cloneDeep,
  merge,
  pick,
} from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { Context } from "./Context.ts";
import { applyMacros, KvList } from "./macros.ts";

export type ActionFnWithContext = (
  context: Context,
  payload: any,
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
  { endpoint, ...config }: any,
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
    init.body = new Blob([JSON.stringify(config.body)], {
      type: "application/json",
    });
  }

  const response = await fetch(context.baseUrl + endpoint, init);
  const body = await response.json();

  // const result = merge(pick(response, "status", "headers"), { body });
  const result = merge(pick(response, "status"), { body });

  return { result, context };
}

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
