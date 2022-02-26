import { ActionFnWithContext, actions } from "./actions.ts";
import { Context } from "./Context.ts";

export class Scenario {
  public init: Action[];
  public hooks: Hook[];
  public steps: Step[];
  private context: Context;

  constructor(data: any) {
    this.context = new Context();
    this.init = data.init.actions.map((action: Object) => new Action(action));
    this.hooks = [];
    this.steps = Object.keys(data.steps).map(
      (name: string) => new Step(name, data.steps[name])
    );
  }

  public async run() {
    console.log("run initialization");
    for (const action of this.init) {
      this.context = await action.handler(this.context, action.payload);
    }

    for (const step of this.steps) {
      console.log(`Running step ${step.label}`);
      for (const action of step.actions) {
        console.log("action", action.handler.name);
        this.context = await action.handler(this.context, action.payload);
      }
    }
    console.log('\nrun end\n',this.context);
    // console.log('\nlast result', this.context.history[this.context.history.length - 1].result);
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

export class Hook /*extends Step*/ {
  public trigger: string;
  constructor() {
    // super(label);
    this.trigger = "";
  }
}

export class Action {
  public handler: ActionFnWithContext;
  public payload: Object;
  public context?: Context;

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
