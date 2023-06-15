import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { Report, Score } from "../../src/Scenario.ts";

const input = {
  "/cars": { post: { "201": false } },
  "/pets": { get: { "200": true, "400": false }, post: { "201": false } },
};

const expected = `/cars
└── post
    └── 201\t❌
/pets
├── get
│   ├── 200\t✔️
│   └── 400\t❌
└── post
    └── 201\t❌
`;

Deno.test("tree", () => {
  const actual = Report.treeTostring(input);
  assertEquals(actual, expected);
});

Deno.test("evaluate rates", () => {
  const underTest = new Report();
  underTest.score = {
    entries: [
      { path: "/pets", verb: "get", response: 200, isCovered: true },
      { path: "/pets", verb: "get", response: 404, isCovered: false },
      { path: "/pets", verb: "post", response: 201, isCovered: true },
      { path: "/pets", verb: "put", response: 200, isCovered: false },
      { path: "/cars", verb: "patch", response: 200, isCovered: true },
      { path: "/houses", verb: "get", response: 200, isCovered: false },
    ],
  };
  assertEquals(underTest.evaluate(), {
    path: 66.67,
    verb: 60.00,
    response: 50,
  });
});
