# Tool for sequencing http requests

## scenario file
keywords:
- init: a special action run at startup
- hooks: list of actions triggered by a response (code, body content. For example: 401, with error body.code: TOKEN_NEEDS_REFRESH)
- steps: list of steps

A step is a list of actions
~A step is a list of tasks~
~A task is a list of actions~

An action
- may update context (eg: update JWT)
- output a state

Do we need a state object? or a states list with immutable states (would allow debugging)?


