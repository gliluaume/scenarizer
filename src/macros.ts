import {
  cloneDeep,
  get,
  set,
} from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { Context } from "./Context.ts";

export type macro = (context: Context, ...values: any[]) => any;

export const macros: Map<string, macro> = new Map([
  ["§previous", _getPrevious],
  ["§context", _getInContext],
]);

// Get value in previous action with given path, searching in context.history
function _getPrevious(context: Context, path: string): any {
  return get(context.last, path);
}

function _getInContext(context: Context, path: string): any {
  return get(context, path);
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
      const substring = [mac.macroName, mac.path].join(".");
      const regexp = new RegExp(substring);

      const replaced = get(newData, mac.contextPath.join(".")).replace(
        regexp,
        macroResult,
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
  macroDescriptors: macroDescriptor[] = [],
): macroDescriptor[] {
  if (typeof data === "object") {
    for (const key in data) {
      searchForMacros(data[key], [...contextPath, key], macroDescriptors);
    }

    return macroDescriptors;
  } else if (typeof data === "string") {
    const macroDesc = [...macros.keys()]
      .map((macroName) => {
        const paths = subSearch(macroName, data);
        return paths
          ? paths.map((path) => ({ macroName, path, contextPath }))
          : false;
      })
      .filter((isMacrosDesc) => !!isMacrosDesc)
      .flat() as unknown as macroDescriptor[];

    if (macroDesc.length > 0) {
      macroDescriptors.push(...macroDesc);
    }
    return macroDescriptors;
  } else {
    return macroDescriptors;
  }
}

function subSearch(macroName: string, candidate: string): string[] | false {
  const regexp = new RegExp(`${macroName}.(?<path>(\\w+\\.?)+)\.*`);
  const sub = new RegExp(`${macroName}.(?<path>(\\w+\\.?)+)`);
  let test = candidate;
  let result: string[] | false = false;
  let match;
  // deno-lint-ignore no-cond-assign
  while ((match = regexp.exec(test))) {
    result = result || [];
    result.push(match?.groups?.path as string);
    test = test.replace(sub, "");
  }

  return result;
}
