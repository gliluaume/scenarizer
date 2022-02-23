import { Context } from "./Context.ts";

// Pipe actions
export class Client {
    public context: Context;
    public static readonly knownActions = [ 'setContext', 'request' ];
    constructor() {
        this.context = new Context();
    }

    public setContext(context: Context) {
        this.context = {
            ...this.context,
            ...context,
        };
    }

    public async request({endpoint, ...config}: any) {
        console.log('request', this.context.baseUrl + endpoint , config)

        const headers = new Headers(this.context.persistentHeaders);
        if (config.headers) {
            Object.keys(config.headers).forEach((name) => {
                headers.append(name, config.headers[name]);
            });
        }

        console.log('----------', JSON.stringify(config.body));
        const response = await fetch(
            this.context.baseUrl + endpoint,
            {
                headers,
                method: config.method.toLocaleUpperCase(),
                body: new Blob([JSON.stringify(config.body)], {type : 'application/json'}),
            });
        return response.json();
    }
}