// deno run --allow-read src/index.ts
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";
import { Scenario } from "./Scenario.ts";

const printUsage = (exitError = true) => {
  const text =
    "Usage: deno run --allow-read --allow-net src/index.ts <filename>";
  (exitError ? console.error : console.info)(text);
  if (exitError) {
    Deno.exit(1);
  }
};

if (Deno.args.length !== 1) {
  printUsage();
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
