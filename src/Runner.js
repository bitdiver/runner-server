'use strict'

import assert from 'assert'
import uuid from 'uuid'
const uuidV4 = uuid.v4

import { getLogAdapter, LEVEL_INFO, LEVEL_ERROR } from './LogAdapterFile'

import { EXECUTION_MODE_BATCH } from '@bitdiver/definition'

import {
  STEP_TYPE_NORMAL,
  STEP_TYPE_SINGLE,
  STEP_TYPE_SERVER_ONLY,
} from '@bitdiver/model'
import {
  EnvironmentRun,
  EnvironmentTestcase,
  STATUS_OK,
  STATUS_ERROR,
} from '@bitdiver/model'

/**
 * The runner executes a suite
 */
export default class Runner {
  constructor(opts = {}) {
    // The run id
    this.id = undefined

    this.logAdapter = opts.logAdapter ? opts.logAdapter : getLogAdapter()

    // Defines how many steps could be executed in paralell
    this.maxParallelSteps = opts.maxParallelSteps ? opts.maxParallelSteps : 5

    this.stepRegistry = opts.stepRegistry

    // The name of the suite
    this.name = opts.name

    // The description of the suite
    this.description = opts.description

    // stores the run environment
    this.environmentRun = undefined

    // A map storing all the testcase environments by there instance ID
    this.environmentTestcaseMap = undefined

    // just store the test case instance ids in the order of the testcase
    this.environmentTestcaseIds = undefined

    // The array with all the steps
    this.steps = undefined

    // The array with all the tzestcase definitions
    this.testcases = undefined

    this.stepExecutionMethod = opts.parallelExecution
      ? '_executeStepMethodParallel'
      : '_executeStepMethodOrdered'
  }

  /**
   * Executes a Suite
   * @param suite {object} The suite definition to be executed
   * @param opts {object} Options for the execution.
   *        testmode=(true/false) Defines if the suite should be executed in testmode or not
   */
  async run(suite, opts) {
    if (this.stepRegistry === undefined) {
      console.log(`The stepregistry is not defined`)
    } else if (this._validateSuite(suite)) {
      this._prepare(suite)
      this._createEnvironments(suite)
      if (suite.executionMode === EXECUTION_MODE_BATCH) {
        await this._doRunBatch(opts)
      } else {
        await this._doRunNormal(opts)
      }
    }
  }

  async _doRunNormal() {
    // TODO
    // The testcases will be executed one after another
  }

  /**
   * Executes a Suite
   * @param opts {object} Options for the execution.
   *        testmode=(true/false) Defines if the suite should be executed in testmode or not
   */
  async _doRunBatch(opts = {}) {
    await this._logStartRun()

    const testMode = opts.testMode ? opts.testMode : false

    // To get the step ids we need the testcase with the longest array of step ids
    let stepIds = []
    this.testcases.forEach(tc => {
      if (tc.steps.length > stepIds.length) {
        stepIds = tc.steps
      }
    })

    // first iterate the steps and then the testscases
    for (let i = 0; i < stepIds.length; i++) {
      const stepId = stepIds[i]
      const stepDefinition = this.steps[stepId]

      if (this.environmentRun.status >= STATUS_ERROR) {
        // Stop the test run
        break
      }

      const steps = []
      let step = this.stepRegistry.getStep(stepDefinition.class)
      step.testMode = testMode
      step.logger = this.logAdapter
      step.environmentRun = this.environmentRun
      if (
        step.type === STEP_TYPE_SINGLE ||
        step.type === STEP_TYPE_SERVER_ONLY
      ) {
        const stepData = []
        this.testcases.forEach(tc => {
          const data = tc.data[i]
          stepData.push(data)
        })

        // there is data or it runs without data
        step.name = stepDefinition.name
        step.description = stepDefinition.description
        step.data = stepData
        step.environmentTestcase = this.environmentTestcaseMap
        steps.push(step)
      } else {
        let counter = 0
        this.testcases.forEach(tc => {
          const data = tc.data[i]
          if (data !== undefined || step.needData === false) {
            // get the testcase environment for this step
            const testcaseInstanceId = this.environmentTestcaseIds[counter]
            assert.ok(
              testcaseInstanceId,
              `Could not get a testcase instance id for testcase '${counter}'`
            )
            const environmentTestcase = this.environmentTestcaseMap.get(
              testcaseInstanceId
            )
            assert.ok(
              environmentTestcase,
              `Could not get a testcase environment for testcase instance id '${testcaseInstanceId}'`
            )
            step.environmentTestcase = environmentTestcase
            // only execute steps for testcases which not have failed
            if (
              environmentTestcase.status === STATUS_OK &&
              environmentTestcase.running
            ) {
              step.name = stepDefinition.name
              step.description = stepDefinition.description
              step.data = data

              steps.push(step)
            }
            // create a new step instance for the next testcase
            step = this.stepRegistry.getStep(stepDefinition.class)
            step.testMode = testMode
            step.logger = this.logAdapter
            step.environmentRun = this.environmentRun
          }
          counter++
        })
      }
      await this._executeSteps(steps)

      // -----------------------
      // if this was the last step for this test case, the test case could be finished
      // -----------------------
      let runCount = 0 // How many test cases have the status running
      for (let tcCount = 0; tcCount < this.testcases.length; tcCount++) {
        const tc = this.testcases[tcCount]
        const tcId = this.environmentTestcaseIds[tcCount]
        const environmentTestcase = this.environmentTestcaseMap.get(tcId)
        if (environmentTestcase.running && tc.steps.length - 1 === i) {
          environmentTestcase.running = false
        }

        if (environmentTestcase.running) {
          runCount++
        }
      }

      if (runCount === 0) {
        // we can stop the suite
        break
      }
    }

    await this._logEndRun()
  }

  /**
   * Executes the given steps
   * @param stepInstances {array} An array of loaded steps to be executed
   *  The instances are the instances per testcase for one real step
   */
  async _executeSteps(stepInstances) {
    await this[this.stepExecutionMethod](stepInstances, ['start'])
    await this[this.stepExecutionMethod](stepInstances, [
      'beforeRun',
      'run',
      'afterRun',
    ])
    await this[this.stepExecutionMethod](stepInstances, ['end'])
  }

  /**
   * Execute all instances of one Step.
   * This method could execute the instances in parallel.
   * @param stepInstances {array} An array of step instances. One instance per testcase
   * @param methods {array} An array of methods which should be executed on each step instance.
   *                        The methods will be executed in the given order
   * @return promise {promise} A promise when all the step instances are executed
   */
  async _executeStepMethodParallel(stepInstances, methods) {
    const promises = []
    let runningSteps = 0
    let stepsDone = 0
    while (stepsDone < stepInstances.length) {
      for (
        let i = stepsDone;
        i < stepInstances.length && runningSteps <= this.maxParallelSteps;
        i++
      ) {
        const stepInstance = stepInstances[stepsDone]
        stepsDone++
        runningSteps++

        // This array stores all the asyc function which needs to be executed in the right order
        const asyncArray = []

        methods.forEach(method => {
          asyncArray.push(() => {
            return stepInstance.logInfo(`Step ${method}`)
            // return this._logStep(stepInstance, `Step ${method}`)
          })
          asyncArray.push(() => {
            return stepInstance[method]()
              .then(() => {
                runningSteps--
              })
              .catch(err => {
                runningSteps--
                promises.push(this.setStepFail(stepInstance, err))
              })
          })
        })

        promises.push(
          asyncArray.reduce((prev, curr) => {
            return prev.then(curr)
          }, Promise.resolve(1))
        )
      }

      // wait 50 ms
      await new Promise(resolve => {
        setTimeout(() => {
          resolve(1)
        }, 50)
      })
    }
    return Promise.all(promises)
  }

  /**
   * Execute all instances of one Step.
   * This method will execute the steps always in the same order.
   * @param stepInstances {array} An array of step instances. One instance per testcase
   * @param methods {array} An array of methods which should be executed on each step instance.
   *                        The methods will be executed in the given order
   * @return promise {promise} A promise when all the step instances are executed
   */
  async _executeStepMethodOrdered(stepInstances, methods) {
    for (const stepInstance of stepInstances) {
      for (const method of methods) {
        await stepInstance.logInfo(`Step ${method}`)
        // await this._logStep(stepInstance, `Step ${method}`)
        try {
          await stepInstance[method]()
        } catch (err) {
          await this.setStepFail(stepInstance, err)
        }
      }
    }
  }

  /**
   * validates the suite
   * @param suite {object} The suite definition to be executed
   * @return status {boolean} true if the suite does not contain any errors
   */
  _validateSuite(suite) {
    if (suite === undefined) {
      throw new Error('No suite defined')
    }
    const errors = suite.validate()
    if (errors.length === 0) {
      return true
    }

    console.log(errors)
    return false
  }

  /**
   * Executes a Suite
   * @param suite {object} The suite definition to be executed
   */
  _prepare(suite) {
    this.id = uuidV4()
    this.name = suite.name
    this.description = suite.description
    this.steps = suite.steps
    this.testcases = suite.testcases
  }

  /**
   * Creates the run environment ans all the testcase environments
   * @param suite {object} The suite definition to be executed
   */
  _createEnvironments(suite) {
    this.environmentTestcaseIds = []
    this.environmentTestcaseMap = new Map()

    // Run environment
    const envRun = new EnvironmentRun()
    envRun.name = suite.name
    envRun.description = suite.description
    this.environmentRun = envRun

    // test case environments
    suite.testcases.forEach(tcDef => {
      const envTc = new EnvironmentTestcase()
      this.environmentTestcaseIds.push(envTc.id)
      this.environmentTestcaseMap.set(envTc.id, envTc)

      envTc.name = tcDef.name
      envTc.description = tcDef.description
    })
  }

  /**
   * Logs the start of a run
   * @param stepInstance {object} The step object
   * @param err {object} The error caused by the step
   * @return promise {promise} A promise indicating when the log was written
   */
  setStepFail(stepInstance, err) {
    stepInstance.status = STATUS_ERROR
    this.environmentRun.status = STATUS_ERROR

    const promises = []

    // Set testcase fail
    if (stepInstance.type === STEP_TYPE_NORMAL) {
      this.setTestcaseFail(stepInstance.environmentTestcase)
    } else {
      this.environmentTestcaseIds.forEach(id => {
        const env = this.environmentTestcaseMap.get(id)
        promises.push(this.setTestcaseFail(env, err))
      })
    }

    // set run fail
    if (this.environmentRun.status < STATUS_ERROR) {
      promises.push(this.setRunFail(err))
    }

    promises.push(stepInstance.logError(err))
    return Promise.all(promises)
  }

  setTestcaseFail(environmentTestcase, err) {
    if (
      environmentTestcase.status < STATUS_ERROR &&
      environmentTestcase.running
    ) {
      environmentTestcase.status = STATUS_ERROR
      environmentTestcase.running = false
      const data = typeof err === 'string' ? { message: err } : err
      const meta = {
        run: {
          start: this.environmentRun.startTime,
          id: this.environmentRun.id,
        },
        tc: {
          id: environmentTestcase.id,
          name: environmentTestcase.name,
        },
      }
      return this.logAdapter.log({ meta, data, logLevel: LEVEL_ERROR })
    }
    return Promise.resolve()
  }

  setRunFail(err) {
    const data = typeof err === 'string' ? { message: err } : err
    const meta = {
      run: {
        start: this.environmentRun.startTime,
        id: this.environmentRun.id,
      },
    }
    return this.logAdapter.log({ meta, data, logLevel: LEVEL_ERROR })
  }

  /**
   * Logs the start of a run
   * @return promise {promise} A promise indicating when the log was written
   */
  _logStartRun() {
    const meta = {
      run: {
        start: this.environmentRun.startTime,
        id: this.environmentRun.id,
      },
    }
    const data = {
      message: 'Start Run',
      suite: this.name,
    }

    return this.logAdapter.log({ meta, data, logLevel: LEVEL_INFO })
  }

  /**
   * Logs the end of a run
   * @return promise {promise} A promise indicating when the log was written
   */
  _logEndRun() {
    const meta = {
      run: {
        start: this.environmentRun.startTime,
        id: this.environmentRun.id,
      },
    }
    const data = {
      message: 'Stop Run',
      suite: this.name,
      status: this.environmentRun.status,
    }
    return this.logAdapter.log({ meta, data, logLevel: LEVEL_INFO })
  }
}
