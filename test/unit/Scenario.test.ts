import { Scenario } from "../../src/Scenario.ts";
import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.165.0/testing/mock.ts";
import { tools } from "../../src/tools.ts";

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

const data = {
  init: {
    score: {
      swagger: "blublu",
      level: "response",
      threshold: 100,
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

Deno.test("scenario", async () => {
  stub(tools, "rantanplan", () => {
    return Promise.resolve({
      status: 200,
      headers: { get: () => "application/json" },
      json: () => Promise.resolve(modkcSwaggerData),
    } as unknown as Response);
  });
  const scenario = new Scenario(data);
  await scenario.run();

  assertEquals(scenario.report, {
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
  });

  assertEquals(scenario.report.asTree, {
    "/cars": { post: { "201": false } },
    "/pets": { get: { "200": true, "400": false }, post: { "201": false } },
  });
});
