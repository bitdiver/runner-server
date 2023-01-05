/**
 * Test the order the steps are executed.
 *
 */

import fs from 'fs'
import path from 'path'
import util from 'util'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'

import { StepRegistry } from '@bitdiver/model'

import { createSuite } from './helper/helper'
import { Runner, ProgressMeterBatch } from '../src/index'
import { getLogAdapterMemory } from '@bitdiver/logadapter'
import { StepSingleLocal } from './helper/StepSingleLocal'
import { StepNormalLocal } from './helper/StepNormalLocal'

const rm = util.promisify(rimraf)

const VOLATILE = path.join(__dirname, 'volatile', 'RunnerAdvanced')
const FIXTURES = path.join(__dirname, 'fixtures', 'RunnerAdvanced')

const logAdapter = getLogAdapterMemory()
const TIMEOUT = 1000000

logAdapter.level = 0

let RESULT: string[] = []

class MyProgressMeter extends ProgressMeterBatch {
  update(): void {
    RESULT.push(
      `MyProgressMeter - S:${this.currentStep} TC:${this.currentTestcase}`
    )
  }
}

class MyStepNormal extends StepNormalLocal {
  async _work(method: string): Promise<void> {
    RESULT.push(
      `NORMAL ${method} ${this.name} ${this.environmentTestcase?.name}`
    )
  }
}

class MyStepSingle extends StepSingleLocal {
  async _work(method: string): Promise<void> {
    if (this.environmentTestcase !== undefined) {
      RESULT.push(`SINGLE ${method} ${this.name}`)
    }
  }
}

const registry = new StepRegistry()
registry.registerStep({ stepName: 'normal', step: MyStepNormal })
registry.registerStep({ stepName: 'single', step: MyStepSingle })

beforeAll(async () => {
  await rm(VOLATILE)
  await mkdirp(VOLATILE)
})

test(
  'Run with file logAdapter',
  async () => {
    const fileNameExpected = path.join(FIXTURES, 'runBatchResult.json')
    const fileNameActual = path.join(VOLATILE, 'runBatchResult.json')

    RESULT = []
    const options = {
      parallelExecution: true,
      posTc: 1, // The tc where to store the action
      posStep: 0, // The step where to store the action
      extendedRes: false, // should create extended log result?
      action: 'logInfo', // The action of the testcase data
      value: 'unknown' // The value for the action
    }

    const singleSteps = new Array(30)
    singleSteps[3] = 1
    singleSteps[7] = 1
    singleSteps[10] = 1
    singleSteps[22] = 1
    singleSteps[27] = 1

    const suiteOptions = {
      testcaseCount: 30,
      stepCount: 30,
      singleSteps
    }

    const suiteDefiniton = createSuite(suiteOptions)

    const data = {
      run: {
        action: options.action,
        value: options.value
      }
    }
    suiteDefiniton.testcases[options.posTc].data[options.posStep] = data
    const runner = new Runner({
      id: 'myGreatId',
      dataDirectory: '',
      suite: suiteDefiniton,
      stepRegistry: registry,
      logAdapter,
      parallelExecution: options.parallelExecution,
      progressMeterBatch: new MyProgressMeter()
    })

    await runner.run()

    await fs.promises.writeFile(
      fileNameActual,
      JSON.stringify(RESULT, null, 2),
      'utf8'
    )

    let expected = RESULT
    try {
      expected = JSON.parse(
        await fs.promises.readFile(fileNameExpected, 'utf8')
      )
    } catch (e) {
      await fs.promises.writeFile(
        fileNameExpected,
        JSON.stringify(RESULT, null, 2),
        'utf8'
      )
    }

    expect(RESULT).toEqual(expected)
  },
  TIMEOUT
)
