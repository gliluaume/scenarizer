## expect Type

`object` ([Details](schema-defs-requestexpect.md))

# expect Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                                     |
| :-------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [settings](#settings) | `object` | Optional | cannot be null | [Scenario](schema-defs-requestexpect-properties-settings.md "/schemas/requestExpect#/$defs/requestExpect/properties/settings") |
| [headers](#headers)   | Multiple | Optional | cannot be null | [Scenario](schema-defs-requestexpect-properties-headers.md "/schemas/requestExpect#/$defs/requestExpect/properties/headers")   |
| [body](#body)         | Multiple | Optional | cannot be null | [Scenario](schema-defs-requestexpect-properties-body.md "/schemas/requestExpect#/$defs/requestExpect/properties/body")         |
| [status](#status)     | `number` | Optional | cannot be null | [Scenario](schema-defs-requestexpect-properties-status.md "/schemas/httpStatus#/$defs/requestExpect/properties/status")        |

## settings



`settings`

*   is optional

*   Type: `object` ([Details](schema-defs-requestexpect-properties-settings.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect-properties-settings.md "/schemas/requestExpect#/$defs/requestExpect/properties/settings")

### settings Type

`object` ([Details](schema-defs-requestexpect-properties-settings.md))

## headers



`headers`

*   is optional

*   Type: any of the following: `string` or `object` ([Details](schema-defs-requestexpect-properties-headers.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect-properties-headers.md "/schemas/requestExpect#/$defs/requestExpect/properties/headers")

### headers Type

any of the following: `string` or `object` ([Details](schema-defs-requestexpect-properties-headers.md))

## body



`body`

*   is optional

*   Type: any of the following: `string` or `object` ([Details](schema-defs-requestexpect-properties-body.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect-properties-body.md "/schemas/requestExpect#/$defs/requestExpect/properties/body")

### body Type

any of the following: `string` or `object` ([Details](schema-defs-requestexpect-properties-body.md))

## status



`status`

*   is optional

*   Type: `number`

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect-properties-status.md "/schemas/httpStatus#/$defs/requestExpect/properties/status")

### status Type

`number`

### status Constraints

**maximum**: the value of this number must smaller than or equal to: `599`

**minimum**: the value of this number must greater than or equal to: `200`
