import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { cloneDeep, } from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { Context, HistoryEntry } from "../../src/Context.ts";
import { applyMacros } from "../../src/macros.ts";

Deno.test("applyMacros simple", () => {
  const context = Object.assign(new Context(), {
    persistentHeaders: {
      "user-agent": "d-edge/1.9",
    },
    history: [new HistoryEntry("init", null, { token: "MyToken" })],
  });
  const data = {
    persistentHeaders: {
      authentication: "Bearer §previous.result.token",
    },
  };
  const contextCpy = cloneDeep(context);
  const dataCpy = cloneDeep(data);

  const actual = applyMacros(data, context);

  assertEquals(context, contextCpy);
  assertEquals(data, dataCpy);
  assertEquals(actual, {
    persistentHeaders: {
      authentication: "Bearer MyToken",
    },
  });
});
