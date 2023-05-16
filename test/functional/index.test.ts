import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

const TIMEOUT = 5000;

const launch = (port: number) => {
  console.log("launch something");
  const command = new Deno.Command(Deno.execPath(), {
    env: { PORT: port.toString()},
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

  const process = command.spawn()
  // console.log("Data received:", new TextDecoder().decode(process.stdout.));
  // console.log("Data received:", process.stdout.getReader());
  // const joined = mergeReadableStreams(process.stdout, process.stderr);

  // const file = await Deno.open("./process_output.txt", {
  //   read: true,
  //   write: true,
  //   create: true,
  // });

  // joined.pipeTo(file.writable).then(() => console.log("pipe join done"));

  return process;
};

const stop = (process: Deno.ChildProcess, delay = TIMEOUT): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      process.stdout.cancel();
      process.stderr.cancel();
      process.kill();
      resolve(true);
    }, delay);
  });
};

Deno.test("functional test", async (tst) => {
  const process = await launch(3002);
  await tst.step("blublu", async () => {
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "--allow-hrtime",
        "--allow-env",
        "--allow-read",
        "--allow-net",
        "--unsafely-ignore-certificate-errors",
        "src/index.ts",
        "docs/samples/scenario.yml"
      ],
    });
    const { code, stdout, stderr } = await command.output();
    console.log("code", code);
    assertEquals(code, 0);

    console.log("stdout", new TextDecoder().decode(stdout));
    console.log("stderr", new TextDecoder().decode(stderr));
  });
  await stop(process, 0);
});
