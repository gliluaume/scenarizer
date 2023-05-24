import { searchForMatchers, subSearch } from "../../../src/matchers.ts";
import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";

Deno.test("subSearch no param", () => {
  assertEquals(subSearch("§match.closeDate", "§match.closeDate"), []);
});

Deno.test("subSearch one", () => {
  assertEquals(subSearch("§match.closeDate", "§match.closeDate 430"), [430]);
});

Deno.test("subSearch two", () => {
  assertEquals(subSearch("§match.number", "§match.number 1 10"), [1, 10]);
});

Deno.test("subSearch regex", () => {
  assertEquals(subSearch("§match.regexp", "§match.regexp [a-z ]+"), [
    "[a-z ]+",
  ]);
});

Deno.test("searchMatcher no param", () => {
  const actual = searchForMatchers({
    id: 1000,
    creationDate: "§match.closeDate",
  });
  assertEquals(actual, [
    {
      matcherName: "§match.closeDate",
      params: [],
      path: ["creationDate"],
    },
  ]);
});

Deno.test("searchMatcher number", () => {
  const actual = searchForMatchers({
    id: 1000,
    age: "§match.number 1 10",
  });
  assertEquals(actual, [
    {
      matcherName: "§match.number",
      params: [1, 10],
      path: ["age"],
    },
  ]);
});

Deno.test("searchMatcher regexp", () => {
  const actual = searchForMatchers({
    id: 1000,
    name: "§match.regexp [a-z ]{1,12}",
  });
  assertEquals(actual, [
    {
      matcherName: "§match.regexp",
      params: ["[a-z ]{1,12}"],
      path: ["name"],
    },
  ]);
});

Deno.test("searchMatcher multiple matchers, in array", () => {
  const example = [
    {
      id: 1000,
      creationDate: "§match.closeDate",
      age: "§match.number 1 85",
    },
    {
      id: 1002,
      creationDate: "§match.closeDate 500",
      style: {
        color: "§match.regexp [a-z]{1,12}",
      },
    },
  ];

  const actual = searchForMatchers(example);

  assertEquals(actual, [
    {
      matcherName: "§match.closeDate",
      params: [],
      path: ["0", "creationDate"],
    },
    {
      matcherName: "§match.number",
      params: [1, 85],
      path: ["0", "age"],
    },
    {
      matcherName: "§match.closeDate",
      params: [500],
      path: ["1", "creationDate"],
    },
    {
      matcherName: "§match.regexp",
      params: ["[a-z]{1,12}"],
      path: ["1", "style", "color"],
    },
  ]);
});

Deno.test("searchMatcher in a complex object", () => {
  const example = {
    foos: [
      {},
      {
        id: 1000,
        bar: [{ baz: { stuff: "§match.number 1" } }],
      },
      {},
    ],
  };
  const actual = searchForMatchers(example);
  assertEquals(actual, [
    {
      matcherName: "§match.number",
      params: [1],
      path: ["foos", "1", "bar", "0", "baz", "stuff"],
    },
  ]);
});
