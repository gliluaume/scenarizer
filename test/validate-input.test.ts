import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { checkYaml } from "../src/schema-validator.ts";

Deno.test("valid full", async () => {
  const yml = `
init:
  actions:
    - updateContext:
        baseUrl: https://\${TEST}:7122
        persistentHeaders:
          x-api-key: 5fbfda2f-a815-49c5-b23b-43bccf1f7ed3
    - request:
        endpoint: /health
steps:
  health:
    label: health
    actions:
      - request:
          endpoint: /health/\${FOO}/stuff/\${BAR}
          method: GET
          expect:
            status: 200
            headers:
              x-custom-foo: 1
              x-custom-bar: baz
            body: |
              {
                "id": "4bf33525-14cd-42e7-89e2-9762a6958173",
                "name": "MyName",
              }
      - updateContext:
          newId: §previous.result.body.id
`;
  const errors = await checkYaml(yml);
  assertEquals(errors.length, 0);
});

Deno.test("valid minimal", async () => {
  const yml = `
init:
  actions:
    - updateContext:
        baseUrl: https://localhost
steps:
  health:
    label: health
    actions:
      - request:
          endpoint: /health
          method: GET
`;
  const errors = await checkYaml(yml);
  assertEquals(errors.length, 0);
});

Deno.test("invalid", async () => {
  const yml = `
init:
  actions:
    - updateContext:
        baseUrl: https://localhost
steps:
  health:
    label: health
    actions:
      - request:
          endpoint: /health
          method: GET
          expect:
            invalidkey: 2
            status: 200
`;
  const errors = await checkYaml(yml);
  assertEquals(errors.length, 3);
});

Deno.test("invalid status", async () => {
  const yml = `
init:
  actions:
    - updateContext:
        baseUrl: https://localhost
steps:
  health:
    label: health
    actions:
      - request:
          endpoint: /health
          method: GET
          expect:
            status: 700
`;
  const errors = await checkYaml(yml);
  assertEquals(errors.length, 3);
  assertEquals(errors[0], {
    keyword: "maximum",
    data: 700,
    dataPath: ".steps['health'].actions[0].request.expect.status",
    schemaPath: "/schemas/httpStatus/maximum",
    params: { comparison: "<=", limit: 599, exclusive: false },
    message: "should be <= 599",
    parentSchema: {
      $id: "/schemas/httpStatus",
      maximum: 599,
      minimum: 200,
      type: "number",
    },
    schema: 599,
  });
});
