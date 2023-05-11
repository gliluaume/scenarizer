export const REGEX = /[^\\\$]*(\$\{(?<varName>[_A-Za-z0-1]*)\})[^\\\$]*/;
// Dirty, with the limitation of 5 env var by line
export const applyEnv = (
  origin: string,
  envVars: { [key: string]: string },
) => {
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
  const varName = match?.groups?.varName;
  const value = envVars[varName as string] || "";
  return s.replace("${" + varName + "}", value || "");
};
