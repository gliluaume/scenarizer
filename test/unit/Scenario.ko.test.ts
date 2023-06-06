import { Scenario } from "../../src/Scenario.ts";
import {
  assertEquals,
  assertThrows,
  assertThrowsAsync,
} from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.165.0/testing/mock.ts";
import { tools } from "../../src/tools.ts";

const data = {
  init: {
    score: {
      swagger: "blublu",
      level: "response",
      threshold: 100,
    },

    actions: [{ updateContext: { baseUrl: "http://localhost:3002" } }],
  },
  steps: {},
};

Deno.test("scenario check response ", async () => {
  stub(tools, "rantanplan", () => {
    return Promise.resolve({
      status: 400,
      headers: { get: () => "application/json" },
      json: Promise.resolve({ a: 1 }),
    } as unknown as Response);
  });
  const scenario = new Scenario(data);
  await assertThrowsAsync(() => scenario.run());
});
