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
  public name: string;
  public payload?: any;
  public result?: any;
  constructor(name: string, payload?: any, result?: any) {
    this.name = name;
    this.payload = payload;
    this.result = result;
  }
}
