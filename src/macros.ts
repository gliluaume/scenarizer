import {
  cloneDeep,
  get,
  set,
} from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { Context } from "./Context.ts";

export type macro = (context: Context, ...values: any[]) => any;

export const macros: Map<string, macro> = new Map([
  ["§previous", _getPrevious],
]);

// Get value in previous action with given path, searching in context.history
function _getPrevious(context: Context, path: string): any {
  return get(context.last, path);
}

export type KVvalue = boolean | string | number | KvList;
export type KvList = { [key: string]: boolean | string | number | KvList };

export function applyMacros(data: KvList, context: Context) {
  const newData = cloneDeep(data);
  const macs = searchForMacros(newData);
  if (macs) {
    (macs as macroDescriptor[]).forEach((mac: macroDescriptor) => {
      const fn = macros.get(mac.macroName) as macro;
      const macroResult = fn(context, mac.path);
      const regexp = new RegExp(`${mac.macroName}\\S*`);
      const replaced = get(newData, mac.contextPath.join(".")).replace(
        regexp,
        macroResult
      );
      set(newData, mac.contextPath.join("."), replaced);
    });
  }

  return newData;
}

type macroDescriptor = {
  macroName: string;
  path: string;
  contextPath: string[];
};
export function searchForMacros(
  data: KvList | KVvalue,
  contextPath: string[] = [],
  macroDescriptors: macroDescriptor[] = []
): macroDescriptor[] {
  if (typeof data === "object") {
    for (const key in data) {
      searchForMacros(data[key], [...contextPath, key], macroDescriptors);
    }

    return macroDescriptors;
  } else if (typeof data === "string") {
    const macroDesc =
      [...macros.keys()]
        .map((macroName) => {
          const path = subSearch(macroName, data);
          return path ? { macroName, path, contextPath } : false;
        })
        .find((isMacroDesc) => isMacroDesc) || false;
    if (macroDesc) {
      macroDescriptors.push(macroDesc);
    }
    return macroDescriptors;
  } else {
    return macroDescriptors;
  }
}

function subSearch(macroName: string, candidate: string): string | false {
  const regexp = new RegExp(`${macroName}.(?<path>(\\w+\.?)+)`);
  const match = regexp.exec(candidate);
  return match?.groups?.path || false;
}
