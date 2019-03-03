/**
 * Test the order the steps are executed.
 *
 */

import fs from 'fs'
import path from 'path'
import util from 'util'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'

import { STEP_TYPE_SINGLE, StepBase, StepRegistry } from '@bitdiver/model'

import { createSuite } from './helper/helper'
import { Runner } from '../lib/index'
import { ProgressMeter } from '../lib/index'
import { getLogAdapterMemory, getLogAdapterFile } from '@bitdiver/logadapter'

const rm = util.promisify(rimraf)
const md = util.promisify(mkdirp)
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

const VOLATILE = path.join(__dirname, 'volatile')
const FIXTURES = path.join(__dirname, 'fixtures')

const logAdapter = getLogAdapterMemory()
const logAdapterFile = getLogAdapterFile()
const TIMEOUT = 1000000

logAdapter.level = 0

let RESULT = []

class MyProgressMeter extends ProgressMeter {
  update() {
    RESULT.push(`S:${this.currentStep} TC:${this.currentTestcase}`)
  }
}

class MyStepNormal extends StepBase {
  /**
   * This method will be called when the step starts.
   */
  async start() {
    await this._work('start')
  }

  /**
   * This method will be called just before the run method
   */
  async beforeRun() {
    await this._work('beforeRun')
  }

  /**
   * This method will be called just before the run method
   */
  async run() {
    await this._work('run')
  }

  /**
   * This method will be called just after the run is finished
   */
  async afterRun() {
    await this._work('afterRun')
  }

  /**
   * This method will be called when the step is finished
   */
  async end() {
    await this._work('end')
  }

  async _work(method) {
    // const min = 5
    // const max = 50

    RESULT.push(`${method} ${this.name} ${this.environmentTestcase.name}`)

    // return new Promise(resolve => {
    //   // const time = Math.floor(Math.random() * (max - min)) + min
    //   const time = 5
    //   setTimeout(() => {
    //     resolve(1)
    //   }, time)
    // })
  }
}

class MyStepSingle extends MyStepNormal {
  constructor(opts = {}) {
    super(opts)
    this.type = STEP_TYPE_SINGLE
  }
  _work(method) {
    RESULT.push(
      `SINGLE ${method} ${this.name} ${this.environmentTestcase.name}`
    )

    // return new Promise(resolve => {
    //   // const min = 5
    //   // const max = 30
    //   // const time = Math.floor(Math.random() * (max - min)) + min
    //   const time = 5
    //   setTimeout(() => {
    //     // console.log(
    //     //   `Execute Single Step '${this.name}' with method '${method}''`
    //     // )
    //     resolve(1)
    //   }, time)
    // })
  }
}

const registry = new StepRegistry()
registry.registerStep('normal', MyStepNormal)
registry.registerStep('single', MyStepSingle)

beforeAll(async () => {
  await rm(VOLATILE)
  await md(VOLATILE)
})

test(
  'Run with file logAdapter',
  async done => {
    RESULT = []
    const options = {
      parallelExecution: true,
      posTc: 1, // The tc where to store the action
      posStep: 0, // The step where to store the action
      extendedRes: false, // should create extended log result?
      action: 'logInfo', // The action of the testcase data
      value: 'unknown', // The value for the action
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
      singleSteps,
    }

    const suiteDefiniton = createSuite(suiteOptions)

    const data = {
      run: {
        action: options.action,
        value: options.value,
      },
    }
    suiteDefiniton.testcases[options.posTc].data[options.posStep] = data

    const runner = new Runner({
      stepRegistry: registry,
      logAdapter: logAdapterFile,
      parallelExecution: options.parallelExecution,
      progressMeter: new MyProgressMeter(),
    })

    await runner.run(suiteDefiniton)

    const fileName = 'runBatchResult.json'

    await writeFile(
      path.join(VOLATILE, fileName),
      JSON.stringify(RESULT, null, 2)
    )

    let expected = RESULT
    try {
      const expectedRaw = await readFile(path.join(FIXTURES, fileName))
      expected = JSON.parse(expectedRaw)
    } catch (e) {
      await writeFile(
        path.join(FIXTURES, fileName),
        JSON.stringify(RESULT, null, 2)
      )
    }

    expect(RESULT).toEqual(expected)

    done()
  },
  TIMEOUT
)
