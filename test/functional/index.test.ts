import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

const testCmd = (tag: string) =>
  new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-hrtime",
      "--allow-env",
      "--allow-read",
      "--allow-net",
      "--unsafely-ignore-certificate-errors",
      "src/index.ts",
      `./test/functional/scenarios/${tag}.yml`,
    ],
  });

const filterUndeterministic = (text: string) =>
  text
    .split("\n")
    .map((line) =>
      line.match(/^duration: /i)
        ? line.replace(/(duration: )(\d+\.?\d*)/i, "$1xxx.xxx")
        : line
    )
    .join("\n");

const testSuite = [
  { tag: "assertion-body", err: 1 },
  { tag: "assertion-header", err: 1 },
  { tag: "assertion-status", err: 1 },
  { tag: "continue-on-failure", err: 1 },
  { tag: "dummy", err: null },
  { tag: "failures", err: 1 },
  { tag: "invalid-schema", err: "Invalid scenario provided" },
  { tag: "matcher-syntax-error", err: "Invalid matcher syntax" },
  { tag: "scenario", err: null },
  { tag: "stop-on-failure", err: 1 },
];

await testSuite.forEach(async ({ tag, err }) => {
  await Deno.test(tag, async () => {
    const expected = await Deno.readTextFile(
      `./test/functional/expectations/${tag}.expected`
    );
    // const process = mockCmd(3002).spawn();
    const command = testCmd(tag);
    const { code, stdout, stderr } = await command.output();

    const error = new TextDecoder().decode(stderr);
    const actual = new TextDecoder().decode(stdout);
    if (err) {
      assertNotEquals(code, 0);
    } else {
      assertEquals(code, 0);
    }
    assertEquals(
      filterUndeterministic(actual),
      filterUndeterministic(expected)
    );
  });
});
