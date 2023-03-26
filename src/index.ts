// deno run --allow-read src/index.ts
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";
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
} catch (e) {
  console.error(e.message);
  printUsage();
}

const data = yamlParse(fileContent) as any;
const scenario = new Scenario(data);
await scenario.run();

// console.log(JSON.stringify(scenario.data, null, " "));
