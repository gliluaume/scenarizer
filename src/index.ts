// deno run --allow-read src/index.ts
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";
import { applyEnv } from "./env-var.ts";
import { Scenario } from "./Scenario.ts";

const printUsage = (exitError = true) => {
  const text =
    "Usage: deno run --allow-read --allow-net src/index.ts <filename>";
  (exitError ? console.error : console.info)(text);
  Deno.exit(exitError ? 1 : 0);
};

if (Deno.args.length !== 1 || [ '-h', '--help' ].includes(Deno.args[0])) {
  printUsage(Deno.args.length !== 1);
}

let fileContent = "";
try {
  fileContent = await Deno.readTextFile(Deno.args[0]);
  fileContent = applyEnv(fileContent, Deno.env.toObject())
} catch (e) {
  console.error(e.message);
  printUsage();
}

const data = yamlParse(fileContent) as any;
const scenario = new Scenario(data);
try {
  await scenario.run();
  console.warn('\n%cTest %csuccess!', 'font-weight: bold', 'color: green; font-weight: bold')
} catch(e) {
  console.error(e.message);
  console.warn('\n%cTest suite %cfailed!', 'font-weight: bold', 'color: red; font-weight: bold')
  Deno.exit(100);
}

// console.log(JSON.stringify(scenario.data, null, " "));
