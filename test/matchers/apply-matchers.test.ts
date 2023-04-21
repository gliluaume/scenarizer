import { cloneDeep } from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { applyMatchers, MatcherDescriptor } from "../../src/matchers.ts";

Deno.test("applyMatchers alters expected if match", () => {
  const expectedBody = {
    id: 1000,
    age: "$match.number 18 45",
  };
  const saveExpBody = cloneDeep(expectedBody);
  const actualBody = {
    id: 534,
    age: 25,
  };
  const matchers = [new MatcherDescriptor("§match.number", [18, 45], ["age"])];
  const actual = applyMatchers(actualBody, expectedBody, matchers);
  assertEquals(actual, {
    id: 1000,
    age: 25,
  });
  assertEquals(expectedBody, saveExpBody);
});

Deno.test("applyMatchers keep expected as is if no match", () => {
  const expectedBody = {
    id: 1000,
    age: "$match.number 18 45",
  };
  const saveExpBody = cloneDeep(expectedBody);
  const actualBody = {
    id: 534,
    age: 5,
  };
  const matchers = [new MatcherDescriptor("§match.number", [18, 45], ["age"])];
  const actual = applyMatchers(actualBody, expectedBody, matchers);
  assertEquals(actual, saveExpBody);
  assertEquals(expectedBody, saveExpBody);
});
