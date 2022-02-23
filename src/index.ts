// deno run --allow-read src/index.ts
import {
  parse as yamlParse,
} from "https://deno.land/std@0.82.0/encoding/yaml.ts";
import { Client } from "./Client.ts";

const data = yamlParse(await Deno.readTextFile("scenario.yml")) as any;

const client = new Client();

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


// TODO: this is bad: use for of like in pipeline.ts
Object.keys(data.steps).forEach(async (stepName) => {
    console.log(`running step ${stepName}`)
    data.steps[stepName].actions.forEach(async (action: any) => {
        const actionName = Object.keys(action)[0];
        console.log(`running action ${actionName}`)
        if (Client.knownActions.includes(actionName)) {
            const actionPayload = action[actionName];
            const actionOut = await (client as any)[actionName](actionPayload);
            console.log('actionOut', actionOut);
        } else {
            console.error('unknown action')
        }
    });

});



console.log(data.steps.login.actions);

// const response = await fetch("http://localhost:8080/model.json", {
//   headers: { tata: "t" },
// });
// console.log(response);
// const js = await response.json();
// console.log(js);
