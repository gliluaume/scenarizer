import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";
import { applyEnv } from "./env-var.ts";
import { Scenario } from "./Scenario.ts";
import { checkYaml, formatErrors } from "./schema-validator.ts";
import { C } from "./formatting.ts";

const assertSchema = async (yamlFileContent: string) => {
  const errors = await checkYaml(yamlFileContent);
  if (errors.length > 0) {
    console.error(`${C.red}Invalid scenario provided${C.reset}`);
    console.log(formatErrors(errors));
    Deno.exit(3);
  }
  console.log("input file is valid");
};

const printUsage = (exitError = true) => {
  const text =
    "Usage: deno run --allow-env --allow-read --allow-net " +
    "--unsafely-ignore-certificate-errors src/index.ts <filename>";
  (exitError ? console.error : console.info)(text);
  Deno.exit(exitError ? 1 : 0);
};

if (Deno.args.length !== 1 || ["-h", "--help"].includes(Deno.args[0])) {
  printUsage(Deno.args.length !== 1);
}

let fileContent = "";
try {
  fileContent = await Deno.readTextFile(Deno.args[0]);
  await assertSchema(fileContent);
  fileContent = applyEnv(fileContent, Deno.env.toObject());
} catch (e) {
  console.error(e.message);
  printUsage();
}

const data = yamlParse(fileContent) as any;
const scenario = new Scenario(data);
try {
  await scenario.run();
  console.log(`${C.bold}Test ${C.green}success!${C.reset}`);
  console.log(`duration: ${scenario.duration} ms`);
} catch (e) {
  console.error(e.message);
  console.log(`${C.bold}Test suite ${C.red}failed.${C.reset}`);
  Deno.exit(100);
}

// console.log(JSON.stringify(scenario.data, null, " "));
