import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { checkScenarioData, checkSyntax, formatMatchersErrors } from "../../src/matchers.ts";

const jsonBody = `
  [
    {
      "id": "§match.number rez",
      "id": "§match.number 3 4 5",
      "dateA": "§match.closeDate zer",
      "dateB": "§match.date 234",
      "reg": "§match.regexp",
      "toto": "§match.uuid 34"
      "none": "§match.foo"
    },
  ]
`.split("\n");

Deno.test("check syntax for JSON body", () => {
  const actual = checkSyntax(jsonBody);
  assertEquals(actual, [
    {
      lineNumber: 3,
      message: "Number params: Bad param types, number expected, given: rez",
    },
    { lineNumber: 4, message: "Number params: Bad number of arguments" },
    {
      lineNumber: 5,
      message:
        "Number params: Bad param types, number expected, given: zer(date)",
    },
    { lineNumber: 6, message: "No param expected" },
    { lineNumber: 7, message: "Exactly one string param expected" },
    { lineNumber: 8, message: "No param expected" },
    { lineNumber: 9, message: 'unknown matcher "§match.foo"' },
  ]);
});

const textBody = `
<Foo>
  yeah {{§match.number 3 4 5}}
</Foo>
`.split("\n");
Deno.test("check syntax for text body", () => {
  const actual = checkSyntax(textBody);
  assertEquals(actual, [
    { lineNumber: 2, message: "Number params: Bad number of arguments" },
  ]);
});

const data = {
  init: { actions: [{ updateContext: { baseUrl: "http://localhost" } }] },
  steps: {
    step1: {
      label: "step 1",
      actions: [
        {
          request: {
            endpoint: "§match.number",
            expect: {
              body: '{\n'+
              '  "age": "§match.number zer",\n'+
              '  "name": "§match.regexp ^[a-z]+$",\n'+
              '  "height": 165\n'+
              '}',
            },
          },
        },
      ],
    },
    step2: {
      label: "step 2",
      actions: [
        {
          request: {
            endpoint: "/home",
            expect: {
              body: '{\n' +
              '  "name": "§match.regexp",\n' +
              '  "age": 33,\n' +
              '  "height": "§match.number rrr"\n' +
              '}',
            },
          },
        },
      ],
    },
  },
};

Deno.test("check syntax for data input", () => {
  const actual = checkScenarioData(data);
  assertEquals(actual, [
    {
      body: data.steps.step1.actions[0].request.expect.body,
      errors: [
        {
          lineNumber: 1,
          message:
            "Number params: Bad param types, number expected, given: zer",
        },
      ],
      path: ["steps", "step1", "action", "request", "expect", "body"],
    },
    {
      body: data.steps.step2.actions[0].request.expect.body,
      errors: [
        { lineNumber: 1, message: "Exactly one string param expected" },
        {
          lineNumber: 3,
          message:
            "Number params: Bad param types, number expected, given: rrr",
        },
      ],
      path: ["steps", "step2", "action", "request", "expect", "body"],
    },
  ]);
});

Deno.test("check error reporting", () => {
  const errors = checkScenarioData(data);
  const actual = formatMatchersErrors(errors);
  const a = actual.split('\n');
  assertEquals(a.length, 15);
  assertEquals(a[0], '\x1b[1msteps.step1.action.request.expect.body\x1b[0m:');
  assertEquals(a[1], '  \x1b[1m1\x1b[0m: Number params: Bad param types, number expected, given: zer');
  assertEquals(a[2], '    1: {');
  assertEquals(a[3], '    \x1b[31m2:   "age": "§match.number zer",\x1b[0m');
  assertEquals(a[4], '    3:   "name": "§match.regexp ^[a-z]+$",');
  assertEquals(a[5], '…');
  assertEquals(a[6], '\x1b[1msteps.step2.action.request.expect.body\x1b[0m:');
  assertEquals(a[7], '  \x1b[1m1\x1b[0m: Exactly one string param expected');
  assertEquals(a[8], '  \x1b[1m3\x1b[0m: Number params: Bad param types, number expected, given: rrr');
  assertEquals(a[9], '    1: {');
  assertEquals(a[10], '    \x1b[31m2:   "name": "§match.regexp",\x1b[0m');
  assertEquals(a[11], '    3:   "age": 33,');
  assertEquals(a[12], '    \x1b[31m4:   "height": "§match.number rrr"\x1b[0m');
  assertEquals(a[13], '    5: }');
  assertEquals(a[14], '…');
});
