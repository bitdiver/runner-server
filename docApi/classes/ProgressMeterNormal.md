[@bitdiver/runner-server](../README.md) / [Exports](../modules.md) / ProgressMeterNormal

# Class: ProgressMeterNormal

This class keeps the progress when running a suite
It is intended to be a base class for other ProgressBars
If currentStep=0 or currentTestcase=0 This means that
no step or test case is currently executing. This should
not be used to update a display. First the step is increased. Then the
testcase is set to '0', then the testcase is set again. But all of these actions
trigger an update.

## Table of contents

### Constructors

- [constructor](ProgressMeterNormal.md#constructor)

### Properties

- [currentStep](ProgressMeterNormal.md#currentstep)
- [currentStepName](ProgressMeterNormal.md#currentstepname)
- [currentTestcase](ProgressMeterNormal.md#currenttestcase)
- [currentTestcaseName](ProgressMeterNormal.md#currenttestcasename)
- [lastStepName](ProgressMeterNormal.md#laststepname)
- [lastTestcaseName](ProgressMeterNormal.md#lasttestcasename)
- [name](ProgressMeterNormal.md#name)
- [stepCount](ProgressMeterNormal.md#stepcount)
- [testcaseCount](ProgressMeterNormal.md#testcasecount)
- [testcaseFailed](ProgressMeterNormal.md#testcasefailed)
- [testcaseStepCount](ProgressMeterNormal.md#testcasestepcount)

### Methods

- [clear](ProgressMeterNormal.md#clear)
- [done](ProgressMeterNormal.md#done)
- [incStep](ProgressMeterNormal.md#incstep)
- [incTestcase](ProgressMeterNormal.md#inctestcase)
- [init](ProgressMeterNormal.md#init)
- [setFail](ProgressMeterNormal.md#setfail)
- [update](ProgressMeterNormal.md#update)

## Constructors

### constructor

• **new ProgressMeterNormal**(`name?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name?` | `string` |

#### Defined in

[progress/ProgressMeterNormal.ts:45](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L45)

## Properties

### currentStep

• **currentStep**: `number` = `0`

The current Step index

#### Defined in

[progress/ProgressMeterNormal.ts:31](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L31)

___

### currentStepName

• **currentStepName**: `string` = `''`

The name of the current step

#### Defined in

[progress/ProgressMeterNormal.ts:43](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L43)

___

### currentTestcase

• **currentTestcase**: `number` = `0`

When working on a step this is the current testcaase per step

#### Defined in

[progress/ProgressMeterNormal.ts:25](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L25)

___

### currentTestcaseName

• **currentTestcaseName**: `string` = `''`

The name of the current Testcase

#### Defined in

[progress/ProgressMeterNormal.ts:40](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L40)

___

### lastStepName

• **lastStepName**: `string` = `''`

The name of the last step

#### Defined in

[progress/ProgressMeterNormal.ts:37](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L37)

___

### lastTestcaseName

• **lastTestcaseName**: `string` = `''`

The name of the last Testcase

#### Defined in

[progress/ProgressMeterNormal.ts:34](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L34)

___

### name

• **name**: `string`

The namne for this progress bar

#### Defined in

[progress/ProgressMeterNormal.ts:13](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L13)

___

### stepCount

• **stepCount**: `number` = `0`

the total count of steps

#### Defined in

[progress/ProgressMeterNormal.ts:19](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L19)

___

### testcaseCount

• **testcaseCount**: `number` = `0`

The total count of testcases

#### Defined in

[progress/ProgressMeterNormal.ts:16](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L16)

___

### testcaseFailed

• **testcaseFailed**: `number` = `0`

the amount of failed testcases

#### Defined in

[progress/ProgressMeterNormal.ts:22](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L22)

___

### testcaseStepCount

• **testcaseStepCount**: `number` = `0`

The count of steps in the current test case

#### Defined in

[progress/ProgressMeterNormal.ts:28](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L28)

## Methods

### clear

▸ **clear**(): `void`

resets all the counter

#### Returns

`void`

#### Defined in

[progress/ProgressMeterNormal.ts:73](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L73)

___

### done

▸ **done**(): `void`

Called when the test is over

#### Returns

`void`

#### Defined in

[progress/ProgressMeterNormal.ts:125](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L125)

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

[progress/ProgressMeterNormal.ts:115](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L115)

___

### incTestcase

▸ **incTestcase**(`name`, `stepCount`): `void`

Increments the current testcase count. Will be called when starting
a new test case in a step.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the current testcase |
| `stepCount` | `number` | - |

#### Returns

`void`

#### Defined in

[progress/ProgressMeterNormal.ts:101](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L101)

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

[progress/ProgressMeterNormal.ts:52](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L52)

___

### setFail

▸ **setFail**(): `void`

increases the number of failed test cases

#### Returns

`void`

#### Defined in

[progress/ProgressMeterNormal.ts:91](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L91)

___

### update

▸ **update**(): `void`

Updates the Output

#### Returns

`void`

#### Defined in

[progress/ProgressMeterNormal.ts:130](https://github.com/bitdiver/runner-server/blob/f02eb89/src/progress/ProgressMeterNormal.ts#L130)
