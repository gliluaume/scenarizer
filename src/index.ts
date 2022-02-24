// deno run --allow-read src/index.ts
import { parse as yamlParse } from "https://deno.land/std@0.82.0/encoding/yaml.ts";
import { Client } from "./Client.ts";
import { Scenario } from "./Scenario.ts";

const data = yamlParse(await Deno.readTextFile("scenario.yml")) as any;

// console.log(data)

const scenario = new Scenario(data);
// console.log('scenario', scenario)

const client = new Client(scenario);
client.run();
// console.log('client', client)


/*
if (data?.init?.actions) {
  data.init.actions.forEach((action: object) => {
    const actionName = Object.keys(action)[0];
    const actionPayload = (action as any)[actionName];

    if (Client.knownActions.includes(actionName)) {
      (client as any)[actionName](actionPayload);
    }
  });
  //   console.log(client.context)
}

Object.keys(data.steps).forEach(async (stepName) => {
  console.log(`running step ${stepName}`);
  data.steps[stepName].actions.forEach(async (action: any) => {
    const actionName = Object.keys(action)[0];
    console.log(`running action ${actionName}`);
    if (Client.knownActions.includes(actionName)) {
      const actionPayload = action[actionName];
      const actionOut = await (client as any)[actionName](actionPayload);
      console.log("actionOut", actionOut);
    } else {
      console.error("unknown action");
    }
  });
});


console.log(data.steps.login.actions);
*/
