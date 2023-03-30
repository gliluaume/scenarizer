import { ActionFnWithContext, actions } from "./actions.ts";
import { Context, HistoryEntry } from "./Context.ts";
import { applyMacros, KvList } from "./macros.ts";
import { C } from "./formatting.ts";

export class Scenario {
  public init: Action[];
  public requestHook?: RequestHook;
  public steps: Step[];
  private context: Context;

  public get data() {
    return this.hideSensitive(this.context);
  }

  private hideSensitive(data: any): any {
    const sensitives = /authori[sz]ation/i;
    const hide = "[REDACTED]";
    if (
        data === null
        || typeof data === 'string'
        || Object.keys(data).length === 0
        || Array.isArray(data)
    ) {
        return data;
    }
    return Object.keys(data).reduce((filtered, key) => {
        filtered[key] = sensitives.exec(key)
          ? hide
          : this.hideSensitive(data[key]);

        return filtered;
      }, {} as any);
  }

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
    console.log("Run initialization");
    await this.runActions(this.init);
    for (const step of this.steps) {
      console.log(`${C.blue}Running${C.reset} ${C.bold}${step.name}${C.reset}: ${step.label}`);
      await this.runActions(step.actions);
    }
  }

  private async runActions(actions: Action[]) {
    for (const action of actions) {
      await this.runAction(action);
    }
  }

  private async runAction(action: Action) {
    action = applyMacros(action as unknown as KvList, this.context);
    console.log("action", action.name, action?.payload?.endpoint || "");
    const response = await action.handler(this.context, action.payload);
    this.context.history.push(new HistoryEntry(action, response.result));

    if (
      this.requestHook &&
      !this.requestHook.disabled &&
      response.result &&
      response.result.status === this.requestHook.status
    ) {
      const actionsFromHook = this.requestHook.replay
        ? [this.requestHook.action, action]
        : [this.requestHook.action];
      this.requestHook.run++;
      await this.runActions(actionsFromHook);
    }

    if (response.context) {
      this.context = response.context;
    }
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

  private _disabled: boolean;
  private _maxRun: number;
  private _run: number;

  public get run() {
    return this._run;
  }
  public set run(val) {
    this._run = Math.min(val, this._maxRun);
    if (this._run === this._maxRun) {
      this._disabled = true;
    }
  }
  public get disabled() {
    return this._disabled;
  }

  // constructor(status: number, criteria: string, action: any) {
  constructor(data: any) {
    this._disabled = false;
    this._maxRun = 3;
    this._run = 0;
    this.status = data.status;
    // this.criteria = new Function(`() => (criteria)`)
    this.action = new Action(data.action);
    this.replay = !!data?.replay;
  }
}

export class Action {
  public handler: ActionFnWithContext;
  public payload: any;
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
