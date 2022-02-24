import set from "https://deno.land/x/lodash@4.17.15-es/set.js";
import { Context, HistoryEntry } from "./Context.ts";
import { macro, macros } from "./macros.ts";

export type ActionFnWithContext = (
  context: Context,
  payload: any
) => Promise<Context>;

export type ActionFn = (payload: Object) => Object;

export const actions: Map<string, ActionFnWithContext> = new Map([
  ["request", request],
  ["setContext", setContext],
]);

async function request(
  context: Context,
  { endpoint, ...config }: any
): Promise<Context> {
  console.log(context, endpoint, config);
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

async function setContext(
  currentContext: Context,
  context: Context
): Promise<Context> {
  currentContext.history.push(new HistoryEntry("setContext"));
  const mac = searchForMacro(context as unknown as KVvalue);
  console.log('mac', mac)
  if (mac)  {
    const fn = macros.get(mac.macroName) as macro;
    const macroResult = fn(currentContext, mac.path);
    console.log('macroResult', macroResult)
    set(context, mac.contextPath.join('.'), macroResult);
  }

  return Object.assign(new Context(), currentContext, context);
}

type KVvalue = boolean | string | number | KvList;
type KvList = { [key: string]: boolean | string | number | KvList };

function searchForMacro(data: KVvalue, contextPath: string[] = []): { macroName: string, path: string, contextPath: string[] } | false {
  if (typeof data === "object") {
    for (const key in data) {
      contextPath.push(key)
      return searchForMacro(data[key], contextPath);
    }
    return false;
  } else if (typeof data === "string") {
    return (
      [...macros.keys()]
        .map((macroName) => {
          const path = subSearch(macroName, data);
          return path ? { macroName, path, contextPath } : false;
        })
        .find((isMacro) => isMacro) || false
    );
  } else {
    return false;
  }
}

function subSearch(macroName: string, candidate: string): string | false {
  const regexp = new RegExp(`${macroName}.(?<path>(\\w+\.?)+)`);
  const match = regexp.exec(candidate);
  return match?.groups?.path || false;
}
