import { stub } from "https://deno.land/std@0.165.0/testing/mock.ts";
import { tools } from "../../src/tools.ts";
import { cloneDeep } from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { assertBody } from "../../src/actions.ts";
import { assertThrows } from "https://deno.land/std@0.99.0/testing/asserts.ts";

stub(tools, "now", () => new Date("2018-09-13T15:16:00.000"));

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

Deno.test("assertBody matchers", () => {
  const expectedBody = {
    id: 1000,
    arr: [
      {
        name: "nameOne",
        recent: "§match.closeDate 5000",
        date: "§match.date",
        age: "§match.number 5 15",
        zip: "§match.regexp ^[\\d]{5}$",
        id: "§match.uuid",
      },
    ],
  };

  const actualBody = {
    id: 1000,
    arr: [
      {
        name: "nameOne",
        recent: "2018-09-13T15:15:58.000",
        date: "2001-01-01T10:00:00",
        age: 10,
        zip: 75001,
        id: "5c101f93-1406-406c-b7fe-da46db4f5601",
      },
    ],
  };
  assertBody(actualBody, expectedBody, false);
});

Deno.test("assertBody matchers not match", () => {
  const expectedBody = {
    id: 1000,
    arr: [
      {
        name: "nameOne",
        recent: "§match.closeDate 5000",
        date: "§match.date",
        age: "§match.number 5 15",
        zip: "§match.regexp ^[d]{6}$",
        id: "§match.uuid",
      },
    ],
  };

  const actualBody = {
    id: 1000,
    arr: [
      {
        name: "nameOne",
        recent: "2010-09-13T15:16:04.000",
        date: "2001",
        age: 1,
        zip: 12375001,
        id: "5c",
      },
    ],
  };
  assertThrows(() => assertBody(actualBody, expectedBody, false));
});
