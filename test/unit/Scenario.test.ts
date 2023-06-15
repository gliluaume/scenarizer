import { Scenario } from "../../src/Scenario.ts";
import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.165.0/testing/mock.ts";
import { tools } from "../../src/tools.ts";
import cloneDeep from "https://deno.land/x/lodash@4.17.15-es/cloneDeep.js";

const modkcSwaggerData = {
  paths: {
    "/pets": {
      post: {
        responses: {
          "201": {},
        },
      },
      get: {
        responses: {
          "200": {
            description: "successful operation",
            schema: {
              type: "array",
              items: { $ref: "#/definitions/Pet" },
            },
          },
          "400": { description: "Invalid status value" },
        },
      },
    },
    "/cars": {
      post: {
        responses: {
          "201": {},
        },
      },
    },
  },
};

stub(tools, "rantanplan", () => {
  return Promise.resolve({
    status: 200,
    headers: { get: () => "application/json" },
    json: () => Promise.resolve(modkcSwaggerData),
  } as unknown as Response);
});

const data = {
  init: {
    score: {
      swagger: "blublu",
      level: "response",
      threshold: 78,
    },

    actions: [{ updateContext: { baseUrl: "http://localhost:3002" } }],
  },
  steps: {
    health: {
      label: "health check",
      actions: [
        {
          request: {
            endpoint: "/pets",
            method: "GET",
            expect: { status: 200 },
          },
        },
      ],
    },
  },
};

const expectedReport = {
  score: {
    entries: [
      {
        isCovered: false,
        path: "/cars",
        response: 201,
        verb: "post",
      },
      { path: "/pets", verb: "get", response: 200, isCovered: true },
      { path: "/pets", verb: "get", response: 400, isCovered: false },
      {
        isCovered: false,
        path: "/pets",
        response: 201,
        verb: "post",
      },
    ],
  },
};

Deno.test("scenario with score threshold not reached", async () => {
  const scenario = new Scenario(data);
  await scenario.run();

  assertEquals(scenario.report, expectedReport);

  assertEquals(scenario.report.asTree, {
    "/cars": { post: { "201": false } },
    "/pets": { get: { "200": true, "400": false }, post: { "201": false } },
  });
  assertEquals(scenario.failed, true);
});

Deno.test("scenario without score check", async () => {
  const input = cloneDeep(data);
  delete input.init.score;
  const scenario = new Scenario(input);
  await scenario.run();

  assertEquals(scenario.failed, false);
});
