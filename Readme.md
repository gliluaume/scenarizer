# Tool for functional REST API testing
This tools supports only HTTP APIs that handle JSON messages.

This is useful to handle a sequential set of requests and make some assertions on what is expected as response.

It fails on first unexpected error or on failed expectation.

## Overview

A scenario is a set of elements:
- init: a special action run at startup
- requestHooks: list of actions triggered by a response (code, body content. For example: 401, with error body.code: TOKEN_NEEDS_REFRESH), allows replay of the previous action which result's has triggered the hook.
- steps: list of steps. A step is a list of actions
- context: which is basically any object like `{ [key: string]: object }`. This context can be seen as the state of a HTTP client. It can be accessed with macros. It also provides an history of processed requests results.

Macros are special keywords:
- `§context`: to access to the context (eg. `§context.login` is a shortcut to the login set in the scenario's context)
- `§previous`: a shortcut to access the previous step in the history of results

### Init

This is the first step of a scenario.

### Actions
Types of actions:
- request: make an HTTP request
- updateContext: update the context of the scenarion (eg: update JWT)


#### Request Action

A function which process a `fetch` (from Deno, same as browser's or node's fetch function) adding expectations on the response.

#### Update context Action

Just sets values in the context.


## Example
```yaml
init:
  actions:
    - updateContext:
        login: api
        password: api
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
  login: # this is the step name
    label: first login
    actions:
      - request:
          endpoint: /api/authentication/login
          method: POST
          body:
            login: §context.login
            password: §context.password
          expect:
            status: 200
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
  home-hotel:
    label: Home page
    actions:
      - request:
          endpoint: /api/home/hotel
          method: GET
```
