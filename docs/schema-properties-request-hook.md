## requestHook Type

`object` ([Request hook](schema-properties-request-hook.md))

# requestHook Properties

| Property                                      | Type          | Required | Nullable       | Defined by                                                                                                                                       |
| :-------------------------------------------- | :------------ | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| [additionalProperties](#additionalproperties) | Not specified | Optional | cannot be null | [Untitled schema](undefined.md "undefined#undefined")                                                                                            |
| [status](#status)                             | `number`      | Optional | cannot be null | [Scenario](schema-defs-requestexpect-properties-status.md "/schemas/httpStatus#/properties/requestHook/properties/status")                       |
| [replay](#replay)                             | `boolean`     | Optional | cannot be null | [Scenario](schema-properties-request-hook-properties-replay.md "https://example.com/schemas/scenario#/properties/requestHook/properties/replay") |
| [action](#action)                             | Merged        | Required | cannot be null | [Scenario](schema-defs-step-properties-actions-items.md "/schemas/action#/properties/requestHook/properties/action")                             |

## additionalProperties

no description

`additionalProperties`

*   is optional

*   Type: unknown

*   cannot be null

*   defined in: [Untitled schema](undefined.md "undefined#undefined")

### Untitled schema Type

unknown

## status



`status`

*   is optional

*   Type: `number`

*   cannot be null

*   defined in: [Scenario](schema-defs-requestexpect-properties-status.md "/schemas/httpStatus#/properties/requestHook/properties/status")

### status Type

`number`

### status Constraints

**maximum**: the value of this number must smaller than or equal to: `599`

**minimum**: the value of this number must greater than or equal to: `200`

## replay



`replay`

*   is optional

*   Type: `boolean`

*   cannot be null

*   defined in: [Scenario](schema-properties-request-hook-properties-replay.md "https://example.com/schemas/scenario#/properties/requestHook/properties/replay")

### replay Type

`boolean`

## action



`action`

*   is required

*   Type: merged type ([Details](schema-defs-step-properties-actions-items.md))

*   cannot be null

*   defined in: [Scenario](schema-defs-step-properties-actions-items.md "/schemas/action#/properties/requestHook/properties/action")

### action Type

merged type ([Details](schema-defs-step-properties-actions-items.md))

any of

*   [Request action](schema-defs-request-action.md "check type definition")

*   [Untitled object in Scenario](schema-defs-updatecontextaction.md "check type definition")
