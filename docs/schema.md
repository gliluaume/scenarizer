## Scenario Type

`object` ([Scenario](schema.md))

# Scenario Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                                      |
| :-------------------------- | :------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------- |
| [init](#init)               | `object` | Required | cannot be null | [Scenario](schema-properties-context-initialisation.md "https://example.com/schemas/scenario#/properties/init") |
| [requestHook](#requesthook) | `object` | Optional | cannot be null | [Scenario](schema-properties-request-hook.md "https://example.com/schemas/scenario#/properties/requestHook")    |
| [steps](#steps)             | `object` | Optional | cannot be null | [Scenario](schema-properties-steps.md "https://example.com/schemas/scenario#/properties/steps")                 |

## init

Actions to be run at scenario initialisation

`init`

*   is required

*   Type: `object` ([Context initialisation](schema-properties-context-initialisation.md))

*   cannot be null

*   defined in: [Scenario](schema-properties-context-initialisation.md "https://example.com/schemas/scenario#/properties/init")

### init Type

`object` ([Context initialisation](schema-properties-context-initialisation.md))

## requestHook

Actions triggered on response matching criteria

`requestHook`

*   is optional

*   Type: `object` ([Request hook](schema-properties-request-hook.md))

*   cannot be null

*   defined in: [Scenario](schema-properties-request-hook.md "https://example.com/schemas/scenario#/properties/requestHook")

### requestHook Type

`object` ([Request hook](schema-properties-request-hook.md))

## steps

Scenarios steps composed of a list of actions

`steps`

*   is optional

*   Type: `object` ([Steps](schema-properties-steps.md))

*   cannot be null

*   defined in: [Scenario](schema-properties-steps.md "https://example.com/schemas/scenario#/properties/steps")

### steps Type

`object` ([Steps](schema-properties-steps.md))

# Scenario Definitions

## Definitions group action

Reference this group by using

```json
{"$ref":"/schemas/action#/$defs/action"}
```

| Property | Type | Required | Nullable | Defined by |
| :------- | :--- | :------- | :------- | :--------- |

## Definitions group requestAction

Reference this group by using

```json
{"$ref":"/schemas/requestAction#/$defs/requestAction"}
```

| Property            | Type     | Required | Nullable       | Defined by                                                                                                                    |
| :------------------ | :------- | :------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| [request](#request) | `object` | Required | cannot be null | [Scenario](schema-defs-request-action-properties-request.md "/schemas/requestAction#/$defs/requestAction/properties/request") |

### request

Configuration of an http request

`request`

*   is required

*   Type: `object` ([Request](schema-defs-request-action-properties-request.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-request-action-properties-request.md "/schemas/requestAction#/$defs/requestAction/properties/request")

#### request Type

`object` ([Request](schema-defs-request-action-properties-request.md))

## Definitions group requestExpect

Reference this group by using

```json
{"$ref":"/schemas/requestExpect#/$defs/requestExpect"}
```

| Property              | Type     | Required | Nullable       | Defined by                                                                                                                     |
| :-------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [settings](#settings) | `object` | Optional | cannot be null | [Scenario](schema-defs-requestexpect-properties-settings.md "/schemas/requestExpect#/$defs/requestExpect/properties/settings") |
| [headers](#headers)   | Multiple | Optional | cannot be null | [Scenario](schema-defs-requestexpect-properties-headers.md "/schemas/requestExpect#/$defs/requestExpect/properties/headers")   |
| [body](#body)         | Multiple | Optional | cannot be null | [Scenario](schema-defs-requestexpect-properties-body.md "/schemas/requestExpect#/$defs/requestExpect/properties/body")         |
| [status](#status)     | `number` | Optional | cannot be null | [Scenario](schema-defs-requestexpect-properties-status.md "/schemas/httpStatus#/$defs/requestExpect/properties/status")        |

### settings



`settings`

*   is optional

*   Type: `object` ([Details](schema-defs-requestexpect-properties-settings.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect-properties-settings.md "/schemas/requestExpect#/$defs/requestExpect/properties/settings")

#### settings Type

`object` ([Details](schema-defs-requestexpect-properties-settings.md))

### headers



`headers`

*   is optional

*   Type: any of the following: `string` or `object` ([Details](schema-defs-requestexpect-properties-headers.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect-properties-headers.md "/schemas/requestExpect#/$defs/requestExpect/properties/headers")

#### headers Type

any of the following: `string` or `object` ([Details](schema-defs-requestexpect-properties-headers.md))

### body



`body`

*   is optional

*   Type: any of the following: `string` or `object` ([Details](schema-defs-requestexpect-properties-body.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect-properties-body.md "/schemas/requestExpect#/$defs/requestExpect/properties/body")

#### body Type

any of the following: `string` or `object` ([Details](schema-defs-requestexpect-properties-body.md))

### status



`status`

*   is optional

*   Type: `number`

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect-properties-status.md "/schemas/httpStatus#/$defs/requestExpect/properties/status")

#### status Type

`number`

#### status Constraints

**maximum**: the value of this number must smaller than or equal to: `599`

**minimum**: the value of this number must greater than or equal to: `200`

## Definitions group httpStatus

Reference this group by using

```json
{"$ref":"/schemas/httpStatus#/$defs/httpStatus"}
```

| Property | Type | Required | Nullable | Defined by |
| :------- | :--- | :------- | :------- | :--------- |

## Definitions group updateContextAction

Reference this group by using

```json
{"$ref":"/schemas/updateContextAction#/$defs/updateContextAction"}
```

| Property                        | Type     | Required | Nullable       | Defined by                                                                                                                                                 |
| :------------------------------ | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [updateContext](#updatecontext) | `object` | Required | cannot be null | [Scenario](schema-defs-updatecontextaction-properties-updatecontext.md "/schemas/updateContextAction#/$defs/updateContextAction/properties/updateContext") |

### updateContext



`updateContext`

*   is required

*   Type: `object` ([Details](schema-defs-updatecontextaction-properties-updatecontext.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-updatecontextaction-properties-updatecontext.md "/schemas/updateContextAction#/$defs/updateContextAction/properties/updateContext")

#### updateContext Type

`object` ([Details](schema-defs-updatecontextaction-properties-updatecontext.md))

## Definitions group step

Reference this group by using

```json
{"$ref":"/schemas/step#/$defs/step"}
```

| Property            | Type     | Required | Nullable       | Defined by                                                                                        |
| :------------------ | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------ |
| [label](#label)     | `string` | Required | cannot be null | [Scenario](schema-defs-step-properties-label.md "/schemas/step#/$defs/step/properties/label")     |
| [actions](#actions) | `array`  | Required | cannot be null | [Scenario](schema-defs-step-properties-actions.md "/schemas/step#/$defs/step/properties/actions") |

### label



`label`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Scenario](schema-defs-step-properties-label.md "/schemas/step#/$defs/step/properties/label")

#### label Type

`string`

### actions



`actions`

*   is required

*   Type: an array of merged types ([Details](schema-defs-step-properties-actions-items.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-step-properties-actions.md "/schemas/step#/$defs/step/properties/actions")

#### actions Type

an array of merged types ([Details](schema-defs-step-properties-actions-items.md))
