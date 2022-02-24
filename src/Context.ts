export class Context {
  public baseUrl?: string;
  public login?: string;
  public password?: string;
  public persistentHeaders?: HeadersInit;
  public history: HistoryEntry[];

  public get last() {
    return this.history[this.history.length - 2];
  }

  public lastResult() {
    return this.history.length > 0
      ? this.history[this.history.length - 1].result
      : null;
  }

  constructor() {
    this.history = [];
  }
}

export class HistoryEntry {
  public label: string;
  public payload?: any;
  public result?: any;
  constructor(label: string, payload?: any, result?: any) {
    this.label = label;
    this.payload = payload;
    this.result = result;
  }
}
