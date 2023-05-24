import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { applyEnv } from "../../src/env-var.ts";

Deno.test("apply env vars simple", () => {
  const yml = `
init:
  actions:
    - updateContext:
        baseUrl: https://\${TEST}:7122
        # baseUrl: http://funny-api
        persistentHeaders:
          X-Api-Key: fb023446-3a59-4013-8e5a-dfb5b39c4925
steps:
  health:
    label: health
    actions:
      - request:
          endpoint: /health/\${FOO}/truc/\${BAR}
          method: GET
`;

  const actual = applyEnv(yml, { TEST: "hola", FOO: "foo", BAR: "bar" });

  assertEquals(
    actual,
    `
init:
  actions:
    - updateContext:
        baseUrl: https://hola:7122
        # baseUrl: http://funny-api
        persistentHeaders:
          X-Api-Key: fb023446-3a59-4013-8e5a-dfb5b39c4925
steps:
  health:
    label: health
    actions:
      - request:
          endpoint: /health/foo/truc/bar
          method: GET
`,
  );
});
