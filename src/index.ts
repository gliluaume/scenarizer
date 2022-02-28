// deno run --allow-read src/index.ts
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";
import { Scenario } from "./Scenario.ts";

const data = yamlParse(await Deno.readTextFile("scenario.yml")) as any;

const scenario = new Scenario(data);
await scenario.run();
