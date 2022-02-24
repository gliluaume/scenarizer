import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { KvList, searchForMacros } from "../src/macros.ts";

Deno.test("searchForMacros simple", () => {
  const input: KvList = {
    persistentHeaders: {
      authentication: "Bearer §previous.result.token",
    },
  };
  assertEquals(searchForMacros(input), [
    {
      macroName: "§previous",
      path: "result.token",
      contextPath: ["persistentHeaders", "authentication"],
    },
  ]);
});

Deno.test("searchForMacros positions", () => {
  const input: KvList = {
    persistentHeaders: {
      authentication: "Bearer §previous.result.token",
    },
    stuff: "§previous.thing",
  };
  assertEquals(searchForMacros(input), [
    {
      macroName: "§previous",
      path: "result.token",
      contextPath: ["persistentHeaders", "authentication"],
    },
    {
      macroName: "§previous",
      path: "thing",
      contextPath: ["stuff"],
    },
  ]);
});

Deno.test("searchForMacros siblings", () => {
  const input: KvList = {
    persistentHeaders: {
      authentication: "Bearer §previous.result.token",
      deviceId: "§previous.result.deviceId",
    },
  };
  assertEquals(searchForMacros(input), [
    {
      macroName: "§previous",
      path: "result.token",
      contextPath: ["persistentHeaders", "authentication"],
    },
    {
      macroName: "§previous",
      path: "result.deviceId",
      contextPath: ["persistentHeaders", "deviceId"],
    },
  ]);
});
