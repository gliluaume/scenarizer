import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

const mockCmd = (port: number) =>
  new Deno.Command(Deno.execPath(), {
    env: { PORT: port.toString() },
    args: [
      "run",
      "--allow-read",
      "--allow-env",
      "--allow-net",
      "test/__mock-server/index.ts",
    ],
    stdout: "piped",
    stderr: "piped",
  });

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
  text.split("\n").map((line) =>
    line.match(/^duration: /i)
      ? line.replace(/(duration: )(\d+\.?\d*)/i, "$1xxx.xxx")
      : line
  ).join("\n");

Deno.test("functional test", async (tst) => {
  const tag = "scenario";
  await tst.step(tag, async () => {
    const expected = await Deno.readTextFile(
      `./test/functional/expectations/${tag}.expected`,
    );
    const process = await mockCmd(3002).spawn();
    const command = testCmd(tag);
    const { code, stdout, stderr } = await command.output();

    const err = new TextDecoder().decode(stderr);
    const actual = new TextDecoder().decode(stdout);
    assertEquals(code, 0);
    assertEquals(
      filterUndeterministic(actual),
      filterUndeterministic(expected),
    );

    process.stdout.cancel();
    process.stderr.cancel();
  });
});
