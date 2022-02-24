import { get } from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';
import { Context } from "./Context.ts";

export type macro = (context: Context, ...values: any[]) => any;

export const macros: Map<string, macro> = new Map([["§previous", _getPrevious]]);

function _getPrevious (context: Context, path: string): any {
    return get(context.last, path)
};
