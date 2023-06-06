function now() {
  return new Date();
}

function rantanplan(
  input: string | URL | Request,
  init?: RequestInit | undefined
) {
  return fetch(input, init);
}

export const tools = { now, rantanplan };
