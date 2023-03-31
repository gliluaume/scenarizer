# Scenarizer
<!-- vscode-markdown-toc -->
* 1. [Usage](#Usage)
* 2. [Overview](#Overview)
	* 2.1. [Init](#Init)
	* 2.2. [Actions](#Actions)
		* 2.2.1. [Request Action](#RequestAction)
		* 2.2.2. [Update context Action](#UpdatecontextAction)
* 3. [Example](#Example)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc --># Scenarizer



This tools supports only HTTP APIs that handle JSON messages.

This is useful to handle a sequential set of requests and make exhaustive assertions on what is expected as response.

It fails on first unexpected error or on failed expectation.

It can interpret environment variables as "${ENV_NAME}" every where in yaml file.

Features overview:
- compare actual and expected on status code, headers and body
- behave like an stateful HTTP client
- hooks on responses: launch actions on response criteria, re-run previous request



##  1. <a name='Usage'></a>Usage
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

##  2. <a name='Overview'></a>Overview

A scenario is a set of elements:
- init: a special action run at startup
- requestHooks: list of actions triggered by a response (code, body content. For example: 401, with error body.code: TOKEN_NEEDS_REFRESH), allows replay of the previous action which result's has triggered the hook.
- steps: list of steps. A step is a list of actions
- context: which is basically any object like `{ [key: string]: object }`. This context can be seen as the state of a HTTP client. It can be accessed with macros. It also provides an history of processed requests results.

Macros are special keywords:
- `§context`: to access to the context (eg. `§context.login` is a shortcut to the login set in the scenario's context)
- `§previous`: a shortcut to access the previous step in the history of results

###  2.1. <a name='Init'></a>Init

This is the first step of a scenario.

###  2.2. <a name='Actions'></a>Actions
Types of actions:
- request: make an HTTP request
- updateContext: update the context of the scenarion (eg: update JWT)


####  2.2.1. <a name='RequestAction'></a>Request Action

A function which processes a `fetch` (from Deno, same as browser's or node's fetch function) adding expectations on the response.
Takes:
- method: GET, PUT, POST, PATCH, DELETE, etc.
- endpoint: the path to be combined with context's base URL. Can include query param
- query: an object to be parsed as query parameters
- body: request payload. If a string is passed passed as is, if object is passed it will be stringified before sending

##### Expectations
- status: checks the http status code
- body: check strict equality. JS Object is compared if `Content-Type` header has `application/json`, string comparison otherwise
- headers: takes an object and checks if each expected header name contains described values. This implies:
  - if expected header is missing or has bad value, error is thrown
  - if actual response has additional headers in comparison to expected headers, no error is thrown

####  2.2.2. <a name='UpdatecontextAction'></a>Update context Action

Just sets values in the context.


##  3. <a name='Example'></a>Example
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
