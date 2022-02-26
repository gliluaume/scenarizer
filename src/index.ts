// deno run --allow-read src/index.ts
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";
import { Scenario } from "./Scenario.ts";

const data = yamlParse(await Deno.readTextFile("scenario.yml")) as any;

// console.log(data)

const scenario = new Scenario(data);
scenario.run();
// console.log('scenario', scenario)

// const client = new Client(scenario);
// client.run();
// console.log('client', client)

