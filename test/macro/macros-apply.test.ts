import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { cloneDeep } from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { Context, HistoryEntry } from "../../src/Context.ts";
import { applyMacros } from "../../src/macros.ts";
import { Action } from "../../src/Scenario.ts";

Deno.test("applyMacros simple", () => {
  const context = Object.assign(new Context(), {
    persistentHeaders: {
      "user-agent": "test/1.9",
    },
    history: [
      new HistoryEntry(new Action({ updateContext: {} }), { token: "MyToken" }),
    ],
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

Deno.test("applyMacros §context", () => {
  const context = Object.assign(new Context(), {
    login: "admin",
    persistentHeaders: {
      "user-agent": "test/1.9",
    },
    history: [],
  });
  const data = {
    expectLogin: "§context.login",
  };
  const contextCpy = cloneDeep(context);
  const dataCpy = cloneDeep(data);

  const actual = applyMacros(data, context);

  assertEquals(context, contextCpy);
  assertEquals(data, dataCpy);
  assertEquals(actual, {
    expectLogin: "admin",
  });
});

[
  {
    template: "My name is '§context.entry' and I like it.",
    value: "michel",
    expected: "My name is 'michel' and I like it.",
    tag: "quoted",
  },
  {
    template: "/api/§context.entry/12EFD",
    value: "entity",
    expected: "/api/entity/12EFD",
    tag: "route like",
  },
].forEach((t) => {
  Deno.test(`applyMacros replacement: ${t.tag}`, () => {
    const context = Object.assign(new Context(), {
      entry: t.value,
    });
    console.log(t);
    console.log(context);
    const data = {
      entry: t.template,
    };
    const contextCpy = cloneDeep(context);
    const dataCpy = cloneDeep(data);

    const actual = applyMacros(data, context);

    assertEquals(context, contextCpy);
    assertEquals(data, dataCpy);
    assertEquals(actual, {
      entry: t.expected,
    });
  });
});
