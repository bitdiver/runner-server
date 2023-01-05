[@bitdiver/runner-server](../README.md) / [Exports](../modules.md) / Runner

# Class: Runner

The runner executes a suite

## Table of contents

### Constructors

- [constructor](Runner.md#constructor)

### Properties

- [dataDirectory](Runner.md#datadirectory)
- [description](Runner.md#description)
- [environmentRun](Runner.md#environmentrun)
- [environmentTestcaseIds](Runner.md#environmenttestcaseids)
- [environmentTestcaseMap](Runner.md#environmenttestcasemap)
- [executionMode](Runner.md#executionmode)
- [id](Runner.md#id)
- [logAdapter](Runner.md#logadapter)
- [maxParallelSteps](Runner.md#maxparallelsteps)
- [name](Runner.md#name)
- [progressMeterBatch](Runner.md#progressmeterbatch)
- [progressMeterNormal](Runner.md#progressmeternormal)
- [stepExecutionMethod](Runner.md#stepexecutionmethod)
- [stepRegistry](Runner.md#stepregistry)
- [steps](Runner.md#steps)
- [testMode](Runner.md#testmode)
- [testcases](Runner.md#testcases)

### Methods

- [\_closeTestcases](Runner.md#_closetestcases)
- [\_createEnvironments](Runner.md#_createenvironments)
- [\_doRunBatch](Runner.md#_dorunbatch)
- [\_doRunNormal](Runner.md#_dorunnormal)
- [\_executeStepMethodOrdered](Runner.md#_executestepmethodordered)
- [\_executeStepMethodParallel](Runner.md#_executestepmethodparallel)
- [\_executeSteps](Runner.md#_executesteps)
- [\_getMethodPromiseFunction](Runner.md#_getmethodpromisefunction)
- [\_getRunStatus](Runner.md#_getrunstatus)
- [\_getStatusForLoglevel](Runner.md#_getstatusforloglevel)
- [\_logEndRun](Runner.md#_logendrun)
- [\_logStartRun](Runner.md#_logstartrun)
- [\_logTestcaseStatus](Runner.md#_logtestcasestatus)
- [\_shouldStopRun](Runner.md#_shouldstoprun)
- [getAllStepIdsForBatchMode](Runner.md#getallstepidsforbatchmode)
- [log](Runner.md#log)
- [run](Runner.md#run)
- [setRunFail](Runner.md#setrunfail)
- [setStepFail](Runner.md#setstepfail)
- [setTestcaseFail](Runner.md#settestcasefail)

## Constructors

### constructor

• **new Runner**(`opts`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `RunnerOptions` |

#### Defined in

[Runner.ts:152](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L152)

## Properties

### dataDirectory

• **dataDirectory**: `string`

The base directory for all the data files of the steps
It will be injected into the run environment

#### Defined in

[Runner.ts:102](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L102)

___

### description

• **description**: `string`

A descriotion for this run

#### Defined in

[Runner.ts:123](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L123)

___

### environmentRun

• `Optional` **environmentRun**: `EnvironmentRun`

The run environment. This is available over all test cases and all steps

#### Defined in

[Runner.ts:126](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L126)

___

### environmentTestcaseIds

• `Optional` **environmentTestcaseIds**: `string`[]

Stores the test case instance ids in the order of the testcase

#### Defined in

[Runner.ts:132](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L132)

___

### environmentTestcaseMap

• `Optional` **environmentTestcaseMap**: `Map`<`string`, `EnvironmentTestcase`\>

Stores all the test case environment by there instance id

#### Defined in

[Runner.ts:129](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L129)

___

### executionMode

• **executionMode**: `ExecutionModeType`

The execution mode 'batch|normal'

#### Defined in

[Runner.ts:144](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L144)

___

### id

• **id**: `string`

The run id. A unique Identifier for the run

#### Defined in

[Runner.ts:96](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L96)

___

### logAdapter

• **logAdapter**: `LogAdapterInterface`

The LogAdapter for the execution

#### Defined in

[Runner.ts:114](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L114)

___

### maxParallelSteps

• **maxParallelSteps**: `number` = `20`

How many steps could be executed in parallel

#### Defined in

[Runner.ts:117](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L117)

___

### name

• **name**: `string`

The name of the suite

#### Defined in

[Runner.ts:105](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L105)

___

### progressMeterBatch

• **progressMeterBatch**: [`ProgressMeterBatch`](ProgressMeterBatch.md)

The progress meter for batch execution

#### Defined in

[Runner.ts:108](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L108)

___

### progressMeterNormal

• **progressMeterNormal**: [`ProgressMeterNormal`](ProgressMeterNormal.md)

The progress meter for normal execution

#### Defined in

[Runner.ts:111](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L111)

___

### stepExecutionMethod

• **stepExecutionMethod**: `stepExecutionMethodType` = `'_executeStepMethodParallel'`

Defnes how the step instances are executed.

#### Defined in

[Runner.ts:141](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L141)

___

### stepRegistry

• **stepRegistry**: `StepRegistry`

The registry containing all the steps

#### Defined in

[Runner.ts:120](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L120)

___

### steps

• **steps**: `Object`

This object contaons all the steps by there stepId

#### Index signature

▪ [key: `string`]: `StepDefinitionInterface`

#### Defined in

[Runner.ts:135](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L135)

___

### testMode

• **testMode**: `boolean` = `false`

When true, then the steps are executed in testMode. Else the steps are executed in
production mode

#### Defined in

[Runner.ts:150](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L150)

___

### testcases

• **testcases**: `TestcaseDefinitionInterface`[]

The array with all the test case definitions

#### Defined in

[Runner.ts:138](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L138)

## Methods

### \_closeTestcases

▸ `Protected` **_closeTestcases**(): `Promise`<`void`\>

ends all the testcases and writes the status to the logger

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:462](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L462)

___

### \_createEnvironments

▸ `Protected` **_createEnvironments**(`suite`): `void`

Creates the run environment ans all the testcase environments

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `suite` | `SuiteDefinitionInterface` | The suite definition to be executed |

#### Returns

`void`

#### Defined in

[Runner.ts:591](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L591)

___

### \_doRunBatch

▸ `Protected` **_doRunBatch**(): `Promise`<`void`\>

Executes a Suiten in batch mode
Itearte the steps and then the test cases. Steps and test cases are a matrix

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:278](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L278)

___

### \_doRunNormal

▸ `Protected` **_doRunNormal**(): `Promise`<`void`\>

Executes a Suiten in normal mode
Itearte the test cases and then the steps in each test case.

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:217](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L217)

___

### \_executeStepMethodOrdered

▸ `Protected` **_executeStepMethodOrdered**(`stepInstances`, `methods`): `Promise`<`void`\>

Execute all instances of one Step.
This method will execute the steps always in the same order.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `stepInstances` | `StepBase`[] | An array of step instances. One instance per testcase |
| `methods` | `string`[] | An array of methods which should be executed on each step instance. The methods will be executed in the given order |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:571](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L571)

___

### \_executeStepMethodParallel

▸ `Protected` **_executeStepMethodParallel**(`stepInstances`, `methods`): `Promise`<`void`\>

Execute all instances of one Step.
This method could execute the instances in parallel.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `stepInstances` | `StepBase`[] | An array of step instances. One instance per testcase |
| `methods` | `any`[] | An array of methods which should be executed on each step instance. The methods will be executed in the given order |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:510](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L510)

___

### \_executeSteps

▸ `Protected` **_executeSteps**(`stepInstances`): `Promise`<`void`\>

Executes the given steps

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `stepInstances` | `StepBase`[] | An array of loaded steps to be executed The instances are the instances per testcase for one real step |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:493](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L493)

___

### \_getMethodPromiseFunction

▸ `Protected` **_getMethodPromiseFunction**(`stepInstance`, `methods`): `PromiseFactory`<`void`\>

Submethod of _executeStepMethodParallel
This method builds a promise which executes the given methods in
the given order

#### Parameters

| Name | Type |
| :------ | :------ |
| `stepInstance` | `StepBase` |
| `methods` | `string`[] |

#### Returns

`PromiseFactory`<`void`\>

#### Defined in

[Runner.ts:536](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L536)

___

### \_getRunStatus

▸ `Protected` **_getRunStatus**(): `any`

Computes the status of this run and returns an object with the detail information

#### Returns

`any`

status - An object with the status summary of this run

#### Defined in

[Runner.ts:423](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L423)

___

### \_getStatusForLoglevel

▸ `Protected` **_getStatusForLoglevel**(`logeLevel`): `number`

Converts the logLevel into a Status

#### Parameters

| Name | Type |
| :------ | :------ |
| `logeLevel` | `string` |

#### Returns

`number`

status - The status

#### Defined in

[Runner.ts:665](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L665)

___

### \_logEndRun

▸ `Protected` **_logEndRun**(`opts?`): `Promise`<`void`\>

Logs the end of a run

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:642](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L642)

___

### \_logStartRun

▸ `Protected` **_logStartRun**(`opts?`): `Promise`<`void`\>

Logs the start of a run

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:622](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L622)

___

### \_logTestcaseStatus

▸ `Protected` **_logTestcaseStatus**(`environmentTestcase`): `Promise`<`void`\>

Writes a test case status message for the given test case

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `environmentTestcase` | `EnvironmentTestcase` | The test case environment |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:798](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L798)

___

### \_shouldStopRun

▸ `Protected` **_shouldStopRun**(): `boolean`

This method checks if there are still test cases in Status less than 'Error'
If no return true

#### Returns

`boolean`

shouldStop - true, if the suite should be stopped

#### Defined in

[Runner.ts:821](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L821)

___

### getAllStepIdsForBatchMode

▸ `Protected` **getAllStepIdsForBatchMode**(): `string`[]

#### Returns

`string`[]

#### Defined in

[Runner.ts:409](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L409)

___

### log

▸ **log**(`logMessage`): `Promise`<`void`\>

The interface of the LogAdapter
The runner is the logger for a step. So the Runner could intercept
and set the status as needed.
In this case the method is called from the step. So all data is in the right
format.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `logMessage` | `any` | The data to be logged |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:698](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L698)

___

### run

▸ **run**(): `Promise`<`void`\>

Executes the Suite

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:192](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L192)

___

### setRunFail

▸ **setRunFail**(`messageObj`, `status?`): `Promise`<`void`\>

Set the environmentRun.running to false and logs
testcase log

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `messageObj` | `any` | `undefined` | The data to be logged |
| `status` | `number` | `STATUS_ERROR` | The Status of this message. Defaul is ERROR |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:776](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L776)

___

### setStepFail

▸ **setStepFail**(`stepInstance`, `err?`): `Promise`<`void`\>

Logs an error of a step where the step throws an error.
Delegates the logging back to the step

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `stepInstance` | `StepBase` | `undefined` | The step object |
| `err` | `any` | `'Unknown Message: Empty error from step execution'` | The error caused by the step |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:682](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L682)

___

### setTestcaseFail

▸ **setTestcaseFail**(`environmentTestcase`, `messageObj`, `status?`): `Promise`<`void`\>

Set the environmentTestcase.running to false and logs
testcase log

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `environmentTestcase` | `EnvironmentTestcase` | `undefined` | The testcase environment |
| `messageObj` | `any` | `undefined` | The data to be logged |
| `status` | `number` | `STATUS_ERROR` | The Status of this message. Defaul is ERROR |

#### Returns

`Promise`<`void`\>

#### Defined in

[Runner.ts:736](https://github.com/bitdiver/runner-server/blob/f02eb89/src/Runner.ts#L736)
