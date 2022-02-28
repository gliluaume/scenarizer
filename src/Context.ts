import { Action } from "./Scenario.ts";

export class Context {
  public baseUrl?: string;
  public login?: string;
  public password?: string;
  public persistentHeaders?: HeadersInit;
  public history: HistoryEntry[];

  public get last() {
    return this.history[this.history.length - 1];
  }

  constructor() {
    this.history = [];
  }
}

export class HistoryEntry {
  public action: Action;
  public result?: any;
  constructor(action: Action, result?: any) {
    this.action = action;
    this.result = result;
  }
}
