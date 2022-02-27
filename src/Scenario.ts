import { ActionFnWithContext, actions } from "./actions.ts";
import { Context, HistoryEntry } from "./Context.ts";

export class Scenario {
  public init: Action[];
  public requestHook?: RequestHook;
  public steps: Step[];
  private context: Context;

  constructor(data: any) {
    this.context = new Context();
    this.init = data.init.actions.map((action: Object) => new Action(action));
    this.requestHook = data.requestHook
      ? new RequestHook(data.requestHook)
      : undefined;
    this.steps = Object.keys(data.steps).map(
      (name: string) => new Step(name, data.steps[name])
    );
  }

  public async run() {
    console.log("run initialization");
    for (const action of this.init) {
      await this.runAction(action);
    }

    for (const step of this.steps) {
      console.log(`Running step ${step.label}`);
      for (const action of step.actions) {
        await this.runAction(action);
      }
    }
  }

  private async runAction(action: Action) {
    const response = await action.handler(this.context, action.payload);

    if (this.requestHook && response.result) {
      if (response.result.status === this.requestHook.status) {
        this.runAction(this.requestHook.action)
      }
    }

    if (response.context) {
      this.context = response.context;
    }

    this.context.history.push(
      new HistoryEntry(action.name, action.payload, response.result)
    );
  }
}

export class Step {
  public name: string;
  public label: string;
  public actions: Action[];
  constructor(name: string, data: any) {
    this.name = name;
    this.label = data.label;
    this.actions = data.actions.map((action: Object) => new Action(action));
  }
}

export class RequestHook {
  public status: number;
  public action: Action;
  public replay: boolean;

  // constructor(status: number, criteria: string, action: any) {
  constructor(data: any) {
    this.status = data.status;
    // this.criteria = new Function(`() => (criteria)`)
    this.action = new Action(data.action);
    this.replay = !!data?.replay;
  }
}

export class Action {
  public handler: ActionFnWithContext;
  public payload: Object;
  public context?: Context;
  public get name() {
    return this.handler.name;
  }

  constructor(data: any) {
    if (Object.keys(data).length !== 1) {
      throw new Error("Only one key expected");
    }

    const name = Object.keys(data)[0];
    if (!actions.has(name)) throw new Error(`Unknown action ${name}`);

    this.handler = actions.get(name) as ActionFnWithContext;
    this.payload = data[name];
  }
}
