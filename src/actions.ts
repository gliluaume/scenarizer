import { Context, HistoryEntry } from "./Context.ts";

export type ActionFnWithContext = (
  context: Context,
  payload: any
) => Promise<Context>;

export type ActionFn = (payload: Object) => Object;

export const actions: Map<string, ActionFnWithContext> = new Map([
  ["request", request],
  ["setContext", setContext],
]);

async function request(context: Context, { endpoint, ...config }: any): Promise<Context> {
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

  console.log('result.token', result.token);

  return context;
}

async function setContext(currentContext: Context, context: Context): Promise<Context> {
  currentContext.history.push(new HistoryEntry("setContext"));
  return Object.assign(
    new Context(),
    currentContext,
    context,
  );
}
