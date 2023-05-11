import { stub } from "https://deno.land/std@0.165.0/testing/mock.ts";
import { Matchers } from "../../src/matchers.ts";
import { tools } from "../../src/tools.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

stub(tools, "now", () => new Date("2018-09-13T15:16:00.256Z"));
Deno.test("matchers: closeDate", () => {
  const fn = Matchers.executor("§match.closeDate")!;
  [
    { candidate: "2018-09-13T15:16:00.156Z", prms: [], expected: true },
    { candidate: "2018-09-13T15:15:59.256Z", prms: [1001], expected: true },
    { candidate: "2021-08-10T11:10:00.123Z", prms: [], expected: false },
  ].forEach(({ candidate, prms, expected }) => {
    assertEquals(fn(candidate, ...prms), expected);
  });
});

Deno.test("matchers: number", () => {
  const fn = Matchers.executor("§match.number")!;
  [
    { candidate: "10", prms: [], expected: true },
    { candidate: "10", prms: [1, 10], expected: true },
    { candidate: "10", prms: [1, 5], expected: false },
    { candidate: "10", prms: [11, 13], expected: false },
  ].forEach(({ candidate, prms, expected }) => {
    assertEquals(fn(candidate, ...prms), expected);
  });
});

Deno.test("matchers: date", () => {
  const fn = Matchers.executor("§match.date")!;
  [
    { candidate: "2021-11-10T11:10:25Z", expected: true },
    { candidate: "2021-11-10T11:10:25.310Z", expected: true },
    { candidate: "10", expected: false },
    { candidate: "foo", expected: false },
  ].forEach(({ candidate, expected }) => {
    assertEquals(fn(candidate), expected);
  });
});

Deno.test("matchers: regexp", () => {
  const fn = Matchers.executor("§match.regexp")!;
  [
    { candidate: "hello", prms: ["^[a-z]+$"], expected: true },
    { candidate: "hello 5", prms: ["^[a-z]+$"], expected: false },
  ].forEach(({ candidate, prms, expected }) => {
    assertEquals(fn(candidate, ...prms), expected);
  });
});

Deno.test("matchers: uuid", () => {
  const fn = Matchers.executor("§match.uuid")!;
  [
    { candidate: "66a9eec0-f653-4819-8637-9ada9b12f472", expected: true },
    { candidate: "66a9eec0", expected: false },
  ].forEach(({ candidate, expected }) => {
    assertEquals(fn(candidate), expected);
  });
});
