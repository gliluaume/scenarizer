import { cloneDeep, merge } from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { Context, HistoryEntry } from "./Context.ts";
import {
  applyMacros,
  KvList,
  KVvalue,
} from "./macros.ts";

export type ActionFnWithContext = (
  context: Context,
  payload: any
) => Promise<Context>;

export type ActionFn = (payload: Object) => Object;

export const actions: Map<string, ActionFnWithContext> = new Map([
  ["request", request],
  ["updateContext", updateContext],
]);

async function request(
  context: Context,
  { endpoint, ...config }: any
): Promise<Context> {
  const headers = new Headers(context.persistentHeaders);
  if (config.headers) {
    Object.keys(config.headers).forEach((name) => {
      headers.append(name, config.headers[name]);
    });
  }
  const response = await fetch(context.baseUrl + endpoint, {
    headers,
    method: config.method.toLocaleUpperCase(),
    body: new Blob([JSON.stringify(config.body)], { type: "application/json" }),
  });

  const result = await response.json();
  context.history.push(
    new HistoryEntry("request", { endpoint, config }, result)
  );

  console.log("result.token", result.token);

  return context;
}

// deno-lint-ignore require-await
async function updateContext(
  context: Context,
  data: KvList
): Promise<Context> {
  const forbidden = ['history'];
  const unauthorized = Object.keys(data).filter((key) => forbidden.includes(key));
  if (unauthorized.length > 0) {
    throw new Error(`Can not update context value(s) ${unauthorized.join(', ')}`);
  }

  const toMerge = applyMacros(data, context);
  const contextCpy = cloneDeep(context);

  contextCpy.history.push(new HistoryEntry("updateContext", toMerge)); // do it at the end and fix Context.last to -1

  return merge(contextCpy, toMerge);
}
