import { cloneDeep } from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { assertBody } from "../../src/actions.ts";
import { assertThrows } from "https://deno.land/std@0.99.0/testing/asserts.ts";

Deno.test("assertBody strict", () => {
  const expectedBody = [
    {
      id: 1000,
      creationDate: "1963-04-13T15:16:53",
    },
  ];

  const actualBody = cloneDeep(expectedBody);
  assertBody(actualBody, expectedBody, false);
});

Deno.test("assertBody strict throws", () => {
  const expectedBody = [
    {
      id: 1000,
      creationDate: "1963-04-13T15:16:53",
    },
  ];

  const actualBody = [
    {
      id: 1000,
      creationDate: "1963-04-13T15:16:54",
    },
  ];
  assertThrows(() => assertBody(actualBody, expectedBody, false));
});

Deno.test("assertBody match", () => {
  const expectedBody = {
    id: 1000,
  };

  const actualBody = {
    id: 1000,
    creationDate: "1963-04-13T15:16:54",
  };
  assertBody(actualBody, expectedBody, true);
});

Deno.test("assertBody match", () => {
  const expectedBody = {
    id: 1000,
  };

  const actualBody = {
    creationDate: "1963-04-13T15:16:54",
  };
  assertThrows(() => assertBody(actualBody, expectedBody, true));
});


