# Overview

This is a tool to sequentially send request and make assertions on responses.

Manifesto:
- write functional test scenarios using a clean configuration file and reduce coding to the minimum
- scenario describe only what is required to make requests
- assertions are easy to write with the intention to be as complete as possible (full document validation) but letting the possibility to the user to compare subsets or template response (matchers and body match).
- should be as simple as possible
- CLI available (easy to run in a CI)

This tool targets APIs that take and return JSON content.

## Features
- compare actual and expected on status code, headers and body
- hooks on responses: launch actions on response status, optionally re-run previous request
- store a state of the client (context)
- store actions and result history
- handles environment variables as "${ENV_NAME}" every where in yaml file.
- macros to access data in context (history and current state)
- matcher to provide template matching on responses

## Alternatives
* [artillery](https://www.artillery.io): multi-protocol, load-testing oriented
* [postman / newman](https://blog.postman.com/meet-newman-a-command-line-companion-for-postman/)

# Get started

## Usage
run
```bash
$ deno task start .\scenario.yml
```

## Scenario

A scenario is a set of elements:
- init: a special action run at startup
- requestHooks: list of actions triggered by a response (code, body content. For example: 401, with error body.code: TOKEN_NEEDS_REFRESH), allows replay of the previous action which result's has triggered the hook.
- steps: list of steps. A step is a list of actions
- context: which is basically any object like `{ [key: string]: object }`. This context can be seen as the state of a HTTP client. It can be accessed with macros. It also provides an history of processed requests results.

Macros are special keywords:
- `§context`: to access to the context (eg. `§context.login` is a shortcut to the login set in the scenario's context)
- `§previous`: a shortcut to access the previous step in the history of results

Matchers are to be included in expectations to provide a loose comparison.

## Schema reference

### Init

This is the first step of a scenario. This is the place where behavior can be configured.
Example:
```yaml
init:
  actions:
    - updateContext:
        settings:
          continue: false
        baseUrl: ${BASE_URL}
```
Details:
- `settings:continue: false` that indicates assertion failure will not stop the scenario
- `baseUrl: ${BASE_URL}`: defines the base url as the value of the environment variable `${BASE_URL}`

### Context

Allows having any key to describe the context object. Some predefined entries are:
```
  baseUrl?: string;
  login?: string;
  password?: string;
  persistentHeaders?: HeadersInit;
  history: HistoryEntry[];
  settings: {
    continue: boolean;
  };
```

### Request hook

Configuration

| key | type | description |
|:--|:--|:--|
| status | number | status code check to trigger hook |
| action | Action | action to be run |
| replay | boolean | re-run previous request or not |

Example
```yaml
requestHook:
  status: 401
  replay: true
  action:
    request:
      endpoint: /api/authentication/refresh
      method: POST
      body:
        login: §context.login
        password: §context.password
```
Explanation:
* for any response with a **401** status code
* run defined request in hook
* re-run previous request (`replay: true`)

### Macros

Use macros to access data set in context or history

```yaml
steps:
  login:
    label: first login
    actions:
      - request:
          endpoint: /api/authentication/login
          method: POST
          body:
            login: §context.login
            password: §context.password
          expect:
            status: 201
      - updateContext:
          persistentHeaders:
            authorization: Bearer §previous.result.body.token
            deviceId: §previous.result.body.deviceId
```
Explanation:
* request takes `login` and `password` from context
* update context action set header values from previous response body as `token` and `deviceId`.

### Matchers

 - closeDate
 - date: any date
 - number [min] [max]: a number, a number >= min, a number <= max
 - regexp [pattern]: a string, a string matchin a pattern
 - uuid: any uuid, uuid/V4, guid, etc. could be a shorthand of a specific case of the previous one

Example:
```yml
steps:
  health:
    label:  health
    actions:
      - request:
          endpoint: /
          method: GET
          expect:
            body: |
              {
                "age": "§match.number 1",
                "height": "175"
              }
```

This would match a response body with `age` property as number greater than 1.

### Environment variables
Environment variables must follow bash syntax with enclosing curly braces like `${VAR}`.

```yaml
init:
  actions:
    - updateContext:
        login: api
        password: ${PASSWORD}
        baseUrl: http://localhost:3005
        persistentHeaders:
          user-agent: test-agent/1.0.0
```
Context is updated by setting password as the current value of the environment variable named `PASSWORD`

### Actions
Types of actions:
- request: make an HTTP request
- updateContext: update the context of the scenarion (eg: update JWT)


#### Request Action

A function which processes a `fetch` (from Deno, same as browser's or node's fetch function) adding expectations on the response.
Takes:
- method: GET, PUT, POST, PATCH, DELETE, etc.
- endpoint: the path to be combined with context's base URL. Can include query param
- query: an object to be parsed as query parameters
- body: request payload. If a string is passed passed as is, if object is passed it will be stringified before sending

##### Expectations
- settings: object giving options on matching results.
  * `matchBody`: execute an [assertObjectMatch](https://deno.land/std@0.182.0/testing/asserts.ts?s=assertObjectMatch) on body to check actual is a subset of expected if true, execute strict deep comparison otherwise. Default value is `false`
- status: checks the http status code
- body: check strict equality. JS Object is compared if `Content-Type` header has `application/json`, string comparison otherwise
- headers: takes an object and checks if each expected header name contains described values. This implies:
  - if expected header is missing or has bad value, error is thrown
  - if actual response has additional headers in comparison to expected headers, no error is thrown

#### Update context Action

Just sets values in the context.

# Example

## Input file sample

[filename](samples/scenario.yml ':include')

## Output

[filename](output-samples/all-ok.html ':include height=290')

# File validation

[Complete schema definition](schema.md)

**Invalid schema**

[filename](output-samples/invalid-schema.html ':include height=392')

# Assertions failures
Here are examples of errors rendering.

**Status code**

[filename](output-samples/assertion-status.html ':include height=134')

**Headers**

[filename](output-samples/assertion-header.html ':include height=134')

**Body**

[filename](output-samples/assertion-body.html ':include height=392')

