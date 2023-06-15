import { Action } from "./actions.ts";
import { Context, HistoryEntry } from "./Context.ts";
import { applyMacros, KvList } from "./macros.ts";
import { C } from "./formatting.ts";
import pick from "https://deno.land/x/lodash@4.17.15-es/pick.js";
import uniqBy from "https://deno.land/x/lodash@4.17.15-es/uniqBy.js";
import { tools } from "./tools.ts";
import cloneDeep from "https://deno.land/x/lodash@4.17.15-es/cloneDeep.js";

export class Scenario {
  public init: Init;
  public requestHook?: RequestHook;
  public steps: Step[];
  private context: Context;
  private swaggerDoc: any;

  public get duration() {
    return performance.now();
  }

  public get data() {
    return this.hideSensitive(this.context);
  }

  private hideSensitive(data: any): any {
    const sensitives = /authori[sz]ation/i;
    const hide = "[REDACTED]";
    if (
      data === null ||
      typeof data === "string" ||
      Object.keys(data).length === 0 ||
      Array.isArray(data)
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
    this.init = {
      score: Object?.assign(new Score(), data?.init?.score),
      actions: data.init.actions.map((action: Object) => new Action(action)),
    };

    this.requestHook = data.requestHook
      ? new RequestHook(data.requestHook)
      : undefined;
    this.steps = Object.keys(data.steps).map(
      (name: string) => new Step(name, data.steps[name]),
    );
  }

  public async run() {
    console.log("Run initialization");
    await this.initialise();
    for (const step of this.steps) {
      console.log(
        `${C.bgBlue}Running${C.reset} ${C.bold}${step.name}${C.reset}: ${step.label}`,
      );
      const result = await this.runActions(step.actions);
      if (result === false && !this.context.settings.continue) {
        return false;
      }
    }
    if (this.init.score.asked) {
      console.log(this.report.asString);
    }
  }

  private async initialise() {
    if (this.init.score.asked) {
      const response = await tools.rantanplan(this.init.score?.swagger);
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      if (response.status !== 200 || !isJson) {
        throw new Error("Invalid response for swagger");
      }
      this.swaggerDoc = await response.json();
    }
    await this.runActions(this.init.actions);
  }

  // TODO refactor
  private _report?: Report;

  public get report(): Report {
    if (!this.init.score.asked) return new Report();
    if (this._report) return this._report;
    const eqlVerbs = (a: string, b: string) =>
      a.toLocaleUpperCase() === b.toLocaleUpperCase();
    const cover = this.covered();
    const entries = [] as IScoreEntry[];
    Object.keys(this.swaggerDoc.paths).forEach((path) => {
      Object.keys(this.swaggerDoc.paths[path]).forEach((verb) => {
        Object.keys(this.swaggerDoc.paths[path][verb].responses).forEach(
          (response) => {
            entries.push({
              path,
              verb: verb.toLocaleLowerCase(),
              response: Number(response),
              isCovered: cover.some(
                (item) =>
                  !!item.result &&
                  item.endpoint === path &&
                  eqlVerbs(item.method, verb) &&
                  item?.expect?.status === Number(response),
              ),
            });
          },
        );
      });
    });

    const sorted = entries.sort((a, b) => {
      if (a.path === b.path && a.verb === b.verb) {
        return a.response - b.response;
      }
      if (a.path === b.path) {
        return a.verb < b.verb ? -1 : a.verb > b.verb ? 1 : 0;
      }
      return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
    });

    this._report = Object.assign(new Report(), { score: { entries: sorted } });
    return this._report;
  }

  private covered() {
    const cov = this.context.history
      .map((entry) => {
        const obj = pick(
          entry?.action?.payload,
          "method",
          "endpoint",
          "expect.status",
        );
        (obj.result = !!entry.result),
          (obj.key = obj.method ? `${obj.method}§${obj.endpoint}` : null);
        return obj;
      })
      .filter((e) => !!e);

    return uniqBy(cov, (entry: { key: string }) => entry.key);
  }

  public get failed() {
    return this.context.history.some((entry) => !entry.result) ||
      this.init.score.asked &&
        this._report?.evaluate()[this.init.score.level] <
          this.init.score.threshold;
  }

  private async runActions(actions: Action[]) {
    for (const action of actions) {
      const result = await this.runAction(action);
      if (result === false && !this.context.settings.continue) {
        return false;
      }
    }
  }

  private async runAction(action: Action) {
    action = applyMacros(action as unknown as KvList, this.context);
    const response = await action.handler(this.context, action);
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
    return response.result;
  }
}

export class Init {
  public actions: Action[];
  public score: Score;
  constructor() {
    this.actions = [];
    this.score = new Score();
  }
}

export class Score {
  public swagger: string;
  public level: "response" | "path" | "verb";
  public threshold: number;
  public get asked() {
    return !!this.swagger;
  }

  constructor() {
    this.swagger = "";
    this.level = "response";
    this.threshold = 100;
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

  constructor(data: any) {
    this._disabled = false;
    this._maxRun = 3;
    this._run = 0;
    this.status = data.status;
    this.action = new Action(data.action);
    this.replay = !!data?.replay;
  }
}

export class Rates {
  path: number;
  verb: number;
  response: number;

  constructor() {
    this.path = -1;
    this.verb = -1;
    this.response = -1;
  }
}

export class Report {
  score?: {
    entries: IScoreEntry[];
  };

  public evaluate(): any {
    const floupi = cloneDeep(this.score?.entries)
      .map((entry: any) => {
        entry.hashes = {
          response: `${entry.path}§${entry.verb}§${entry.response}`,
          verb: `${entry.path}§${entry.verb}`,
          path: entry.path,
        };
        return entry;
      })
      .reduce(
        (stuff: any, entry: any) => {
          stuff.path[entry.hashes.path] = !!stuff.path[entry.hashes.path] ||
            entry.isCovered;
          stuff.verb[entry.hashes.verb] = !!stuff.verb[entry.hashes.verb] ||
            entry.isCovered;
          stuff.response[entry.hashes.response] =
            !!stuff.response[entry.hashes.verb] || entry.isCovered;
          return stuff;
        },
        { path: {}, verb: {}, response: {} },
      );

    return Object.keys(floupi).reduce((rates: any, key) => {
      const section = floupi[key];
      const all = Object.keys(section).length;
      const covered = Object.keys(section).filter((k) => !!section[k]).length;
      rates[key] = +Number.parseFloat((100 * covered / all).toString()).toFixed(
        2,
      );
      return rates;
    }, {});
  }

  public get asTree() {
    return this.score?.entries.reduce((tree: any, entry: IScoreEntry) => {
      if (tree[entry.path]) {
        if (tree[entry.path][entry.verb]) {
          tree[entry.path][entry.verb][entry.response] = entry.isCovered;
        } else {
          tree[entry.path][entry.verb] = { [entry.response]: entry.isCovered };
        }
      } else {
        tree[entry.path] = {
          [entry.verb]: { [entry.response]: entry.isCovered },
        };
      }
      return tree;
    }, {});
  }

  public get asString() {
    return Report.treeTostring(this.asTree);
  }

  public static treeTostring(obj: any, indent = " ") {
    let output = "";
    const headers = {
      last: "└──",
      some: "├──",
      branch: "│   ",
      blank: "    ",
    };
    const icons = {
      ok: "✔️",
      ko: "❌",
    };

    const keys = Object.keys(obj).sort();

    keys.forEach((key, index) => {
      output += key + "\n";
      const methodKeys = Object.keys(obj[key]).sort();
      methodKeys.forEach((methodKey, methodIndex) => {
        const methodHeader = methodKeys.length === methodIndex + 1
          ? headers.last
          : headers.some;
        output += `${methodHeader} ${methodKey}\n`;
        const responseKeys = Object.keys(obj[key][methodKey]).sort();
        responseKeys.forEach((responseKey, responseIndex) => {
          const preHeader = methodKeys.length === methodIndex + 1
            ? headers.blank
            : headers.branch;

          const responseHeader = responseKeys.length === responseIndex + 1
            ? preHeader + headers.last
            : preHeader + headers.some;
          const result = obj[key][methodKey][responseKey] ? icons.ok : icons.ko;
          output += `${responseHeader} ${responseKey}\t${result}\n`;
        });
      });
    });
    return output;
  }
}

export type Verb =
  | "HEAD"
  | "OPTIONS"
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";
export type StatusCode = number;

export interface IScoreEntry {
  isCovered: boolean;
  path: string;
  verb: string;
  response: number;
}
