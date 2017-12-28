'use strict'

import assert from 'assert'
import uuid from 'uuid'
const uuidV4 = uuid.v4

import { STEP_TYPE_SINGLE, STEP_TYPE_SERVER_ONLY } from '@bitdiver/model'
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
  }

  /**
   * Executes a Suite
   * @param suite {object} The suite definition to be executed
   * @param opts {object} Options for the execution.
   *        testmode=(true/false) Defines if the suite should be executed in testmode or not
   */
  run(suite, opts) {
    if (this.stepRegistry === undefined) {
      console.log(`The stepregistry is not defined`)
    } else if (suite.testcases.length > 0 && suite.steps.length > 0) {
      this._prepare(suite)
      this._createEnvironments(suite)
      this._doRun(opts)
    } else {
      console.log(`ERROR: The suite contains no testcases or no steps`)
    }
  }

  /**
   * Executes a Suite
   * @param opts {object} Options for the execution.
   *        testmode=(true/false) Defines if the suite should be executed in testmode or not
   */
  _doRun(opts = {}) {
    const testMode = opts.testMode ? opts.testMode : false

    // first iterate the steps and then the tetscases
    for (let i = 0; i < this.steps.length; i++) {
      const stepDefinition = this.steps[i]
      const stepData = stepDefinition.data
      debugger

      if (this.environmentRun.status === STATUS_ERROR) {
        break
      }

      const steps = []
      const step = this.stepRegistry.getStep(stepDefinition.class)
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
          const testcaseEnvironment = this.environmentTestcase.get(
            testcaseInstanceId
          )
          assert.ok(
            testcaseEnvironment,
            `Could not get a testcase environment for testcase instance id '${testcaseInstanceId}'`
          )
          step.testcaseEnvironment = testcaseEnvironment

          // only execute steps for testcases which not have failed
          if (testcaseEnvironment.status === STATUS_OK) {
            step.name = stepDefinition.name
            step.description = stepDefinition.description
            step.data = data

            steps.push(step)
          }
          counter++
        })
      }
      this._executeSteps(steps)
    }
  }

  /**
   * Executes the given steps
   * @param steps {array} An array of loaded steps to be executed
   */
  _executeSteps(stepInstances) {
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
        const promise = stepInstance.start()
        if (
          promise !== undefined &&
          promise.then !== undefined &&
          typeof promise.then === 'function'
        ) {
          promise
            .then(() => {
              runningSteps--
            })
            .catch(err => {
              runningSteps--
              this.setStepFail(stepInstance, err)
            })
        } else {
          throw new Error(
            `The 'start' method of the step '${
              stepInstance.name
            }' must return a promise`
          )
        }
      }
    }
  }

  setStepFail() {
    // stepInstance, err
    // TODO
  }

  setTestcaseFail() {
    // TODO
    // TODO proof if there are still running testcase. if not set the runEnvironment status to false
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
}
