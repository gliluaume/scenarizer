import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { Report } from "../../src/Scenario.ts";

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
