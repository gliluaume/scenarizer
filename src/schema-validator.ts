import Ajv, { ErrorObject } from "npm:ajv@6";
import schema from "./schema.json" assert { type: "json" };
import {
  parse as yamlParse,
  stringify as yamlStringify,
} from "https://deno.land/std@0.82.0/encoding/yaml.ts";
import { C } from "./formatting.ts";

export const checkYaml = async (yamlData: string): Promise<ErrorObject[]> => {
  const data = yamlParse(yamlData) as any;
  const ajv = new Ajv({ verbose: true });
  const validate = ajv.compile(schema);
  await validate(data);
  return validate?.errors || [];
};

export const formatErrors = (errors: ErrorObject[]) => {
  return errors
    .map(
      (error) =>
        `${C.bold}${error.dataPath}${C.reset}: ` +
        `${error.message}, given: ${formatActual(error.data)}`
    )
    .join("\n");
};

const formatActual = (data: any) =>
  typeof data === "object"
    ? `\n${yamlStringify(data)}`
    : `${C.red}${data}${C.reset}`;
