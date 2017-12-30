'use strict'

import assert from 'assert'
import uuid from 'uuid'
const uuidV4 = uuid.v4

import { getLogAdapter, LEVEL_INFO, LEVEL_ERROR } from './LogAdapterFile'

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
    this.environmentTestcase = undefined

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
    } else if (suite.testcases.length > 0 && suite.steps.length > 0) {
      this._prepare(suite)
      this._createEnvironments(suite)
      await this._doRun(opts)
    } else {
      console.log(`ERROR: The suite contains no testcases or no steps`)
    }
  }

  /**
   * Executes a Suite
   * @param opts {object} Options for the execution.
   *        testmode=(true/false) Defines if the suite should be executed in testmode or not
   */
  async _doRun(opts = {}) {
    await this._logStartRun()

    const testMode = opts.testMode ? opts.testMode : false

    // first iterate the steps and then the testscases
    for (let i = 0; i < this.steps.length; i++) {
      const stepDefinition = this.steps[i]
      const stepData = stepDefinition.data

      if (this.environmentRun.status === STATUS_ERROR) {
        // Stop the test run
        break
      }

      const steps = []
      let step = this.stepRegistry.getStep(stepDefinition.class)
      step.testMode = testMode
      if (
        step.type === STEP_TYPE_SINGLE ||
        step.type === STEP_TYPE_SERVER_ONLY
      ) {
        // there is data or it runs without data
        step.name = stepDefinition.name
        step.description = stepDefinition.description
        step.data = stepData
        steps.push(step)
      } else if (stepData.length > 0) {
        let counter = 0
        stepData.forEach(data => {
          // get the testcase environment for this step
          const testcaseInstanceId = this.environmentTestcaseIds[counter]
          assert.ok(
            testcaseInstanceId,
            `Could not get a testcase instance id for testcase '${counter}'`
          )
          const environmentTestcase = this.environmentTestcase.get(
            testcaseInstanceId
          )
          assert.ok(
            environmentTestcase,
            `Could not get a testcase environment for testcase instance id '${testcaseInstanceId}'`
          )
          step.environmentTestcase = environmentTestcase

          // only execute steps for testcases which not have failed
          if (environmentTestcase.status === STATUS_OK) {
            step.name = stepDefinition.name
            step.description = stepDefinition.description
            step.data = data

            steps.push(step)
          }
          counter++
          // create a new step instance for the next testcase
          step = this.stepRegistry.getStep(stepDefinition.class)
        })
      }
      await this._executeSteps(steps)
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
            return this._logStep(stepInstance, `Step ${method}`)
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

  // This will execute the steps always in the same order
  async _executeStepMethodOrdered(stepInstances, methods) {
    for (const stepInstance of stepInstances) {
      for (const method of methods) {
        await this._logStep(stepInstance, `Step ${method}`)
        try {
          await stepInstance[method]()
        } catch (err) {
          console.log('ERROR: ', err.stack)
          await this.setStepFail(stepInstance, err)
        }
      }
    }
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
    this.environmentTestcase = new Map()

    // Run environment
    const envRun = new EnvironmentRun()
    envRun.name = suite.name
    envRun.description = suite.description
    this.environmentRun = envRun

    // test case environments
    suite.testcases.forEach(tcDef => {
      const envTc = new EnvironmentTestcase()
      this.environmentTestcaseIds.push(envTc.id)
      this.environmentTestcase.set(envTc.id, envTc)

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

    if (stepInstance.type === STEP_TYPE_NORMAL) {
      stepInstance.environmentTestcase.status = STATUS_ERROR
    } else {
      this.environmentTestcaseIds.forEach(id => {
        const env = this.environmentTestcase.get(id)
        env.status = STATUS_ERROR
      })
    }
    return this._logStep(stepInstance, err, LEVEL_ERROR)
  }

  /**
   * Logs the start of a run
   * @param stepInstance {object} The step object
   * @param message {object} The message to be logged
   * @return promise {promise} A promise indicating when the log was written
   */
  _logStep(stepInstance, message, logLevel = LEVEL_INFO) {
    if (stepInstance.type === STEP_TYPE_NORMAL) {
      const meta = {
        timeRunStart: this.environmentRun.startTime,
        idRun: this.environmentRun.id,
        idTestcase: stepInstance.environmentTestcase.id,
        idStep: stepInstance.stepInstanceId,
      }
      const data = {
        logLevel,
        message,
        stepType: stepInstance.type,
        step: stepInstance.name,
        testcase: stepInstance.environmentTestcase.name,
        suite: this.name,
      }
      return this.logAdapter.log({ meta, data })
    }

    // set all testcases to FAIL
    const promises = []
    for (const id of this.environmentTestcaseIds) {
      const env = this.environmentTestcase.get(id)
      const meta = {
        timeRunStart: this.environmentRun.startTime,
        idRun: this.environmentRun.id,
        idTestcase: env.id,
        idStep: stepInstance.stepInstanceId,
      }
      const data = {
        logLevel,
        message,
        stepType: stepInstance.type,
        step: stepInstance.name,
        testcase: env.name,
        suite: this.name,
      }
      promises.push(this.logAdapter.log({ meta, data }))
    }
    return Promise.all(promises)
  }

  /**
   * Logs the start of a run
   * @return promise {promise} A promise indicating when the log was written
   */
  _logStartRun() {
    const meta = {
      timeRunStart: this.environmentRun.startTime,
      idRun: this.environmentRun.id,
    }
    const data = {
      loglevel: LEVEL_INFO,
      message: 'Start Run',
      suite: this.name,
    }

    return this.logAdapter.log({ meta, data })
  }

  /**
   * Logs the end of a run
   * @return promise {promise} A promise indicating when the log was written
   */
  _logEndRun() {
    const meta = {
      timeRunStart: this.environmentRun.startTime,
      idRun: this.environmentRun.id,
    }
    const data = {
      loglevel: LEVEL_INFO,
      message: 'Stop Run',
      suite: this.name,
      status: this.environmentRun.status,
    }

    return this.logAdapter.log({ meta, data })
  }
}
