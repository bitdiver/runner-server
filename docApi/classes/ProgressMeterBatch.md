[@bitdiver/runner-server](../README.md) / [Exports](../modules.md) / ProgressMeterBatch

# Class: ProgressMeterBatch

This class keeps the progress when running a suite
It is intended to be a base class for other ProgressBars
If currentStep=0 or currentTestcase=0 This means that
no step or test case is currently executing. This should
not be used to update a display. First the step is increased. Then the
testcase is set to '0', then the testcase is set again. But all of these actions
trigger an update.

## Hierarchy

- **`ProgressMeterBatch`**

  ↳ [`ProgressBarConsoleBatch`](ProgressBarConsoleBatch.md)

  ↳ [`ProgressBarConsoleLogBatch`](ProgressBarConsoleLogBatch.md)

  ↳ [`ProgressBarConsoleLogBatchJson`](ProgressBarConsoleLogBatchJson.md)

## Table of contents

### Constructors

- [constructor](ProgressMeterBatch.md#constructor)

### Properties

- [currentStep](ProgressMeterBatch.md#currentstep)
- [currentStepName](ProgressMeterBatch.md#currentstepname)
- [currentTestcase](ProgressMeterBatch.md#currenttestcase)
- [currentTestcaseName](ProgressMeterBatch.md#currenttestcasename)
- [lastStepName](ProgressMeterBatch.md#laststepname)
- [lastTestcaseName](ProgressMeterBatch.md#lasttestcasename)
- [name](ProgressMeterBatch.md#name)
- [stepCount](ProgressMeterBatch.md#stepcount)
- [testcaseCount](ProgressMeterBatch.md#testcasecount)
- [testcaseFailed](ProgressMeterBatch.md#testcasefailed)

### Methods

- [clear](ProgressMeterBatch.md#clear)
- [done](ProgressMeterBatch.md#done)
- [incStep](ProgressMeterBatch.md#incstep)
- [incTestcase](ProgressMeterBatch.md#inctestcase)
- [init](ProgressMeterBatch.md#init)
- [setFail](ProgressMeterBatch.md#setfail)
- [startOverTestcase](ProgressMeterBatch.md#startovertestcase)
- [update](ProgressMeterBatch.md#update)

## Constructors

### constructor

• **new ProgressMeterBatch**(`name?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name?` | `string` |

#### Defined in

[progress/ProgressMeterBatch.ts:42](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L42)

## Properties

### currentStep

• **currentStep**: `number` = `0`

The current Step index

#### Defined in

[progress/ProgressMeterBatch.ts:28](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L28)

___

### currentStepName

• **currentStepName**: `string` = `''`

The name of the current step

#### Defined in

[progress/ProgressMeterBatch.ts:40](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L40)

___

### currentTestcase

• **currentTestcase**: `number` = `0`

When working on a step this is the current testcaase per step

#### Defined in

[progress/ProgressMeterBatch.ts:25](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L25)

___

### currentTestcaseName

• **currentTestcaseName**: `string` = `''`

The name of the current Testcase

#### Defined in

[progress/ProgressMeterBatch.ts:37](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L37)

___

### lastStepName

• **lastStepName**: `string` = `''`

The name of the last step

#### Defined in

[progress/ProgressMeterBatch.ts:34](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L34)

___

### lastTestcaseName

• **lastTestcaseName**: `string` = `''`

The name of the last Testcase

#### Defined in

[progress/ProgressMeterBatch.ts:31](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L31)

___

### name

• **name**: `string`

The namne for this progress bar

#### Defined in

[progress/ProgressMeterBatch.ts:13](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L13)

___

### stepCount

• **stepCount**: `number` = `0`

the total count of steps

#### Defined in

[progress/ProgressMeterBatch.ts:19](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L19)

___

### testcaseCount

• **testcaseCount**: `number` = `0`

The total count of testcases

#### Defined in

[progress/ProgressMeterBatch.ts:16](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L16)

___

### testcaseFailed

• **testcaseFailed**: `number` = `0`

the amount of failed testcases

#### Defined in

[progress/ProgressMeterBatch.ts:22](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L22)

## Methods

### clear

▸ **clear**(): `void`

resets all the counter

#### Returns

`void`

#### Defined in

[progress/ProgressMeterBatch.ts:70](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L70)

___

### done

▸ **done**(): `void`

Called when the test is over

#### Returns

`void`

#### Defined in

[progress/ProgressMeterBatch.ts:125](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L125)

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

#### Defined in

[progress/ProgressMeterBatch.ts:115](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L115)

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

#### Defined in

[progress/ProgressMeterBatch.ts:49](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L49)

___

### setFail

▸ **setFail**(): `void`

increases the number of failed test cases

#### Returns

`void`

#### Defined in

[progress/ProgressMeterBatch.ts:86](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L86)

___

### startOverTestcase

▸ **startOverTestcase**(): `void`

When a step is finisched the test case counting starts again

#### Returns

`void`

#### Defined in

[progress/ProgressMeterBatch.ts:105](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L105)

___

### update

▸ **update**(): `void`

Updates the Output

#### Returns

`void`

#### Defined in

[progress/ProgressMeterBatch.ts:130](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterBatch.ts#L130)
