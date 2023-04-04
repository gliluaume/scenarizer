export const C = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  greenl: "\x1b[1;32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  bluel: "\x1b[36m",
  white: "\x1b[37m",
  purple: "\x1b[34m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgWhite: "\x1b[47m",
  bgBluel: "\x1b[46m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

export const methodsColors = new Map([
  ["HEAD", C.purple],
  ["OPTIONS", C.blue],
  ["GET", C.bluel],
  ["POST", C.green],
  ["PUT", C.yellow],
  ["PATCH", C.greenl],
  ["DELETE", C.red],
]);
