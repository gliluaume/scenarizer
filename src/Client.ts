import { Context } from "./Context.ts";
import { Scenario } from "./Scenario.ts";

export class Client {
    public context: Context;
    public scenario: Scenario;

    constructor(scenario: Scenario) {
        this.context = new Context();
        this.scenario = scenario;
    }

    public run() {
        this.scenario.run(this.context);
    }


    // public static readonly knownActions = [ 'setContext', 'request' ];
    // public setContext(context: Context) {
    //     this.context = {
    //         ...this.context,
    //         ...context,
    //     };
    // }

    // public async request({endpoint, ...config}: any) {
    //     const headers = new Headers(this.context.persistentHeaders);
    //     if (config.headers) {
    //         Object.keys(config.headers).forEach((name) => {
    //             headers.append(name, config.headers[name]);
    //         });
    //     }
    //     const response = await fetch(
    //         this.context.baseUrl + endpoint,
    //         {
    //             headers,
    //             method: config.method.toLocaleUpperCase(),
    //             body: new Blob([JSON.stringify(config.body)], {type : 'application/json'}),
    //         });
    //     return response.json();
    // }

}