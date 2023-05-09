## request Type

`object` ([Details](schema-defs-requestaction-properties-request.md))

# request Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                                                                           |
| :-------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [endpoint](#endpoint) | `string` | Optional | cannot be null | [Scenario](schema-defs-requestaction-properties-request-properties-endpoint.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/endpoint") |
| [method](#method)     | `string` | Optional | cannot be null | [Scenario](schema-defs-requestaction-properties-request-properties-method.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/method")     |
| [query](#query)       | `object` | Optional | cannot be null | [Scenario](schema-defs-requestaction-properties-request-properties-query.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/query")       |
| [headers](#headers)   | Multiple | Optional | cannot be null | [Scenario](schema-defs-requestaction-properties-request-properties-headers.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/headers")   |
| [body](#body)         | Multiple | Optional | cannot be null | [Scenario](schema-defs-requestaction-properties-request-properties-body.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/body")         |
| [expect](#expect)     | `object` | Optional | cannot be null | [Scenario](schema-defs-requestexpect.md "/schemas/requestExpect#/$defs/requestAction/properties/request/properties/expect")                                          |

## endpoint



`endpoint`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Scenario](schema-defs-requestaction-properties-request-properties-endpoint.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/endpoint")

### endpoint Type

`string`

## method



`method`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Scenario](schema-defs-requestaction-properties-request-properties-method.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/method")

### method Type

`string`

## query



`query`

*   is optional

*   Type: `object` ([Details](schema-defs-requestaction-properties-request-properties-query.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestaction-properties-request-properties-query.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/query")

### query Type

`object` ([Details](schema-defs-requestaction-properties-request-properties-query.md))

## headers



`headers`

*   is optional

*   Type: any of the following: `string` or `object` ([Details](schema-defs-requestaction-properties-request-properties-headers.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestaction-properties-request-properties-headers.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/headers")

### headers Type

any of the following: `string` or `object` ([Details](schema-defs-requestaction-properties-request-properties-headers.md))

## body



`body`

*   is optional

*   Type: any of the following: `string` or `object` ([Details](schema-defs-requestaction-properties-request-properties-body.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestaction-properties-request-properties-body.md "/schemas/requestAction#/$defs/requestAction/properties/request/properties/body")

### body Type

any of the following: `string` or `object` ([Details](schema-defs-requestaction-properties-request-properties-body.md))

## expect



`expect`

*   is optional

*   Type: `object` ([Details](schema-defs-requestexpect.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect.md "/schemas/requestExpect#/$defs/requestAction/properties/request/properties/expect")

### expect Type

`object` ([Details](schema-defs-requestexpect.md))
