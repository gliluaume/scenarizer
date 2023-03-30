export const REGEX = /[^\\\$]*(\$\{(?<varName>[_A-Za-z0-1]*)\})[^\\\$]*/;
// Dirty, with the limitation of 5 env var by line
export const applyEnv = (origin: string, envVars: { [key: string]: string }) => {
  return origin
    .split("\n")
    .map((line) => applyOnLine(line, envVars))
    .join("\n");
};

const applyOnLine = (s: string, envVars: { [key: string]: string }) => {
  while (REGEX.exec(s)) {
    s = applyOnFirst(s, envVars);
  }
  return s;
};

const applyOnFirst = (s: string, envVars: { [key: string]: string }) => {
  const match = REGEX.exec(s);
  if (!match) return s;
  const varName = match?.groups?.varName;
  const value = envVars[varName as string] || "";
  return s.replace("${" + varName + "}", value || "");
};

// let str = "place de ${TEST} haha";
// const EnvVars = Deno.env.toObject();
// console.log(applyOnLine("place de rien haha", EnvVars));
// console.log(applyOnLine("place de ${TEST} haha", EnvVars));
// console.log(
//   applyOnLine("place de ${TEST} haha ${FOO} et ${BAR} hihi", EnvVars)
// );

// const yml = `
// init:
//   actions:
//     - updateContext:
//         baseUrl: https://\${TEST}:7122
//         # baseUrl: http://dedge-buckets-api
//         persistentHeaders:
//           X-DEdge-Api-Key: fb023446-3a59-4013-8e5a-dfb5b39c4925
// steps:
//   health:
//     label: health
//     actions:
//       - request:
//           endpoint: /health/\${FOO}/truc/\${BAR}
//           method: GET
// `;

// const actual = applyEnv(yml, { TEST: "hola", FOO: "foo", BAR: "bar" });
// console.log(actual)