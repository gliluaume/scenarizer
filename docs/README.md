# Scenarizer

This tools supports only HTTP APIs that handle JSON messages.

This is useful to handle a sequential set of requests and make exhaustive assertions on what is expected as response.


**Features overview:**
- compare actual and expected on status code, headers and body
- behave like an stateful HTTP client
- hooks on responses: launch actions on response status, optionally re-run previous request
- store actions and result history
- handles environment variables as "${ENV_NAME}" every where in yaml file.
- macros to access data in context (history and current state)

**Behavior**
It fails on first unexpected error or on failed expectation.


## Usage
run
```
❯ deno run --allow-read --allow-net --unsafely-ignore-certificate-errors .\src\index.ts .\scenario.yml
```

Deployment (no Ci for now):
manual tag
```
git tag X.Y.Z && git push-tags
```

build docker image:
```
docker build --tag gliluaume/scenarizer:X.Y.Z .
```

publish docker image
```
docker login
docker push gliluaume/scenarizer:X.Y.Z
```

## Overview

A scenario is a set of elements:
- init: a special action run at startup
- requestHooks: list of actions triggered by a response (code, body content. For example: 401, with error body.code: TOKEN_NEEDS_REFRESH), allows replay of the previous action which result's has triggered the hook.
- steps: list of steps. A step is a list of actions
- context: which is basically any object like `{ [key: string]: object }`. This context can be seen as the state of a HTTP client. It can be accessed with macros. It also provides an history of processed requests results.

Macros are special keywords:
- `§context`: to access to the context (eg. `§context.login` is a shortcut to the login set in the scenario's context)
- `§previous`: a shortcut to access the previous step in the history of results

## Scenario file reference

### Init

This is the first step of a scenario.

### Context

TODO

### Request hook

TODO

### Macros

TODO

### Matchers

TODO

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


## Example
```yaml
init:
  actions:
    - updateContext:
        login: api
        password: ${PASSWORD}
        baseUrl: http://localhost:3005
        persistentHeaders:
          user-agent: test-agent/1.0.0
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
  deep-health:
    label: Deep health
    actions:
      - request:
          endpoint: /health
          method: GET
  stuff:
    label: Fetching single stuff
    actions:
      - request:
          endpoint: /api/stuffs/7610cafc-8037-404c-b498-5255b6bc7c52
          method: GET
          expect:
            settings:
              bodyMatch: true
            status: 200
            headers:
              x-my-custom-data: "a value"
            body: |
              {
                "id": "7610cafc-8037-404c-b498-5255b6bc7c52",
                "name": "first-one",
                "type": "stuff-a",
              }
  stuffs:
    label: Fetching multiple stuffs
    actions:
      - request:
          endpoint: /api/stuffs/
          query:
            type: flower
          method: GET
          expect:
            status: 200
            headers:
              x-my-custom-data: "a value"
            body: |
              []
```


# File validation
```bash
steps.step1.action.request.expect.body:
  1: Number params: Bad param types, number expected, given: zer
    1: {
    2:   "age": "§match.number zer",
    3:   "name": "§match.regexp ^[a-z]+$",
…
steps.step2.action.request.expect.body:
  1: Exactly one string param expected
  3: Number params: Bad param types, number expected, given: rrr
    1: {
    2:   "name": "§match.regexp",
    3:   "age": 33,
    4:   "height": "§match.number rrr"
    5: }
…
```

# Assertions failures
## Status code
```scz
Running health: health
request GET /
status /: (actual) \x1b[31m200\x1b[0m != 201 (expected)
Test suite failed.
```

![missing image](images/assertion-status-code.png "Status code assertion failed")

## Headers
```scz-assertion
Running health: health
request GET /
header hello: (actual) null != world (expected)
Test suite failed.
```

## Body
```scz-assertion
error: AssertionError: Values are not equal:


    [Diff] Actual / Expected


    [
      {
-       creationDate: "1963-04-13T15:16:54",
+       creationDate: "1963-04-13T15:16:53",
        id: 1000,
      },
    ]
```