[@bitdiver/runner-server](../README.md) / [Exports](../modules.md) / ProgressBarConsoleLogBatchJson

# Class: ProgressBarConsoleLogBatchJson

This class keeps the progress when running a suite
It is intended to be a base class for other ProgressBars
If currentStep=0 or currentTestcase=0 This means that
no step or test case is currently executing. This should
not be used to update a display. First the step is increased. Then the
testcase is set to '0', then the testcase is set again. But all of these actions
trigger an update.

## Hierarchy

- [`ProgressMeterBatch`](ProgressMeterBatch.md)

  ↳ **`ProgressBarConsoleLogBatchJson`**

## Table of contents

### Constructors

- [constructor](ProgressBarConsoleLogBatchJson.md#constructor)

### Properties

- [currentStep](ProgressBarConsoleLogBatchJson.md#currentstep)
- [currentStepName](ProgressBarConsoleLogBatchJson.md#currentstepname)
- [currentTestcase](ProgressBarConsoleLogBatchJson.md#currenttestcase)
- [currentTestcaseName](ProgressBarConsoleLogBatchJson.md#currenttestcasename)
- [lastStepName](ProgressBarConsoleLogBatchJson.md#laststepname)
- [lastTestcaseName](ProgressBarConsoleLogBatchJson.md#lasttestcasename)
- [name](ProgressBarConsoleLogBatchJson.md#name)
- [sequence](ProgressBarConsoleLogBatchJson.md#sequence)
- [stepCount](ProgressBarConsoleLogBatchJson.md#stepcount)
- [testcaseCount](ProgressBarConsoleLogBatchJson.md#testcasecount)
- [testcaseFailed](ProgressBarConsoleLogBatchJson.md#testcasefailed)
- [timeFormat](ProgressBarConsoleLogBatchJson.md#timeformat)

### Methods

- [\_printFooter](ProgressBarConsoleLogBatchJson.md#_printfooter)
- [\_printHeader](ProgressBarConsoleLogBatchJson.md#_printheader)
- [\_writeLog](ProgressBarConsoleLogBatchJson.md#_writelog)
- [clear](ProgressBarConsoleLogBatchJson.md#clear)
- [done](ProgressBarConsoleLogBatchJson.md#done)
- [incStep](ProgressBarConsoleLogBatchJson.md#incstep)
- [incTestcase](ProgressBarConsoleLogBatchJson.md#inctestcase)
- [init](ProgressBarConsoleLogBatchJson.md#init)
- [log](ProgressBarConsoleLogBatchJson.md#log)
- [setFail](ProgressBarConsoleLogBatchJson.md#setfail)
- [startOverTestcase](ProgressBarConsoleLogBatchJson.md#startovertestcase)
- [update](ProgressBarConsoleLogBatchJson.md#update)

## Constructors

### constructor

• **new ProgressBarConsoleLogBatchJson**(`opts`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.name` | `string` |
| `opts.timeFormat?` | `string` |

#### Overrides

[ProgressMeterBatch](ProgressMeterBatch.md).[constructor](ProgressMeterBatch.md#constructor)

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:10](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L10)

## Properties

### currentStep

• **currentStep**: `number` = `0`

The current Step index

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[currentStep](ProgressMeterBatch.md#currentstep)

#### Defined in

[progress/ProgressMeterBatch.ts:28](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L28)

___

### currentStepName

• **currentStepName**: `string` = `''`

The name of the current step

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[currentStepName](ProgressMeterBatch.md#currentstepname)

#### Defined in

[progress/ProgressMeterBatch.ts:40](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L40)

___

### currentTestcase

• **currentTestcase**: `number` = `0`

When working on a step this is the current testcaase per step

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[currentTestcase](ProgressMeterBatch.md#currenttestcase)

#### Defined in

[progress/ProgressMeterBatch.ts:25](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L25)

___

### currentTestcaseName

• **currentTestcaseName**: `string` = `''`

The name of the current Testcase

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[currentTestcaseName](ProgressMeterBatch.md#currenttestcasename)

#### Defined in

[progress/ProgressMeterBatch.ts:37](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L37)

___

### lastStepName

• **lastStepName**: `string` = `''`

The name of the last step

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[lastStepName](ProgressMeterBatch.md#laststepname)

#### Defined in

[progress/ProgressMeterBatch.ts:34](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L34)

___

### lastTestcaseName

• **lastTestcaseName**: `string` = `''`

The name of the last Testcase

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[lastTestcaseName](ProgressMeterBatch.md#lasttestcasename)

#### Defined in

[progress/ProgressMeterBatch.ts:31](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L31)

___

### name

• **name**: `string`

The namne for this progress bar

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[name](ProgressMeterBatch.md#name)

#### Defined in

[progress/ProgressMeterBatch.ts:13](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L13)

___

### sequence

• **sequence**: `number`

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:5](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L5)

___

### stepCount

• **stepCount**: `number` = `0`

the total count of steps

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[stepCount](ProgressMeterBatch.md#stepcount)

#### Defined in

[progress/ProgressMeterBatch.ts:19](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L19)

___

### testcaseCount

• **testcaseCount**: `number` = `0`

The total count of testcases

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[testcaseCount](ProgressMeterBatch.md#testcasecount)

#### Defined in

[progress/ProgressMeterBatch.ts:16](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L16)

___

### testcaseFailed

• **testcaseFailed**: `number` = `0`

the amount of failed testcases

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[testcaseFailed](ProgressMeterBatch.md#testcasefailed)

#### Defined in

[progress/ProgressMeterBatch.ts:22](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L22)

___

### timeFormat

• **timeFormat**: `string`

The luxon time format

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:8](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L8)

## Methods

### \_printFooter

▸ **_printFooter**(): `void`

#### Returns

`void`

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:28](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L28)

___

### \_printHeader

▸ **_printHeader**(): `void`

#### Returns

`void`

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:18](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L18)

___

### \_writeLog

▸ **_writeLog**(`logMessage`): `void`

This method will do the work. It is called by the log method
if the logLevel of the message shows that the message is relavant for logging

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `logMessage` | `any` | The message to be logged |

#### Returns

`void`

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:101](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L101)

___

### clear

▸ **clear**(): `void`

resets all the counter

#### Returns

`void`

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[clear](ProgressMeterBatch.md#clear)

#### Defined in

[progress/ProgressMeterBatch.ts:70](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L70)

___

### done

▸ **done**(): `void`

Called when the test is over

#### Returns

`void`

#### Overrides

[ProgressMeterBatch](ProgressMeterBatch.md).[done](ProgressMeterBatch.md#done)

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:41](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L41)

___

### incStep

▸ **incStep**(`name`): `void`

Increments the current step count. Will be called when starting
a new step.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the current step |

#### Returns

`void`

#### Overrides

[ProgressMeterBatch](ProgressMeterBatch.md).[incStep](ProgressMeterBatch.md#incstep)

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:60](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L60)

___

### incTestcase

▸ **incTestcase**(`name`): `void`

Increments the current testcase count. Will be called when starting
a new test case in a step.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the current testcase |

#### Returns

`void`

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[incTestcase](ProgressMeterBatch.md#inctestcase)

#### Defined in

[progress/ProgressMeterBatch.ts:96](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L96)

___

### init

▸ **init**(`request`): `void`

Initializes the count of the test cases and steps

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | `Object` |
| `request.name?` | `string` |
| `request.stepCount` | `number` |
| `request.testcaseCount` | `number` |

#### Returns

`void`

#### Overrides

[ProgressMeterBatch](ProgressMeterBatch.md).[init](ProgressMeterBatch.md#init)

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:46](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L46)

___

### log

▸ **log**(`message`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `any` |

#### Returns

`void`

#### Defined in

[progress/ProgressBarConsoleLogBatchJson.ts:82](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressBarConsoleLogBatchJson.ts#L82)

___

### setFail

▸ **setFail**(): `void`

increases the number of failed test cases

#### Returns

`void`

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[setFail](ProgressMeterBatch.md#setfail)

#### Defined in

[progress/ProgressMeterBatch.ts:86](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L86)

___

### startOverTestcase

▸ **startOverTestcase**(): `void`

When a step is finisched the test case counting starts again

#### Returns

`void`

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[startOverTestcase](ProgressMeterBatch.md#startovertestcase)

#### Defined in

[progress/ProgressMeterBatch.ts:105](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L105)

___

### update

▸ **update**(): `void`

Updates the Output

#### Returns

`void`

#### Inherited from

[ProgressMeterBatch](ProgressMeterBatch.md).[update](ProgressMeterBatch.md#update)

#### Defined in

[progress/ProgressMeterBatch.ts:130](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L130)
