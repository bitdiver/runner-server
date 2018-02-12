'use strict'

import assert from 'assert'
import uuid from 'uuid'
const uuidV4 = uuid.v4

import { getLogAdapter } from './LogAdapterFile'
import ProgressMeter from './ProgressMeter'

import { EXECUTION_MODE_BATCH } from '@bitdiver/definition'

import {
  STEP_TYPE_NORMAL,
  STEP_TYPE_SINGLE,
  STEP_TYPE_SERVER_ONLY,
  DIR_BASE_DATA,
} from '@bitdiver/model'
import {
  EnvironmentRun,
  EnvironmentTestcase,
  STATUS_OK,
  STATUS_UNKNOWN,
  STATUS_WARNING,
  STATUS_ERROR,
  STATUS_FATAL,
  LEVEL_INFO,
  LEVEL_WARNING,
  LEVEL_ERROR,
  LEVEL_FATAL,
  generateLogs,
} from '@bitdiver/model'

/**
 * The runner executes a suite
 */
export default class Runner {
  constructor(opts = {}) {
    // The run id
    this.id = undefined

    // The base directory for all the data files of the steps
    // It will be injected into the run environment
    this.dataDir = opts.dataDir ? opts.dataDir : ''

    this.progressMeter = opts.progressMeter
      ? opts.progressMeter
      : new ProgressMeter({ name: opts.name })

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

    // The object with all the steps by there stepId
    this.steps = undefined

    // The array with all the test case definitions
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
    assert.ok(suite, 'The run method needs a suite to be executed')

    if (this.stepRegistry === undefined) {
      throw new Error(`The stepregistry is not defined`)
    } else if (this._validateSuite(suite)) {
      this._prepare(suite)
      this._createEnvironments(suite)

      const stepCount = Object.keys(this.steps).length
      const testcaseCount = this.testcases.length
      this.progressMeter.init({ testcaseCount, stepCount, name: suite.name })
      this.progressMeter.clear()

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
    throw new Error(`The method '_doRunNormal' is not yet implemented`)
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

    const stepCount = Object.keys(this.steps).length

    // first iterate the steps and then the testscases
    for (let i = 0; i < stepIds.length; i++) {
      if (this._shoulStopRun()) {
        // OK we can stop the run here
        break
      }

      this.progressMeter.startOverTestcase()

      const stepId = stepIds[i]
      const stepDefinition = this.steps[stepId]

      const steps = []
      let step = this.stepRegistry.getStep(stepDefinition.class)
      step.countCurrent = i + 1
      step.countAll = stepCount
      step.testMode = testMode
      step.logAdapter = this
      step.environmentRun = this.environmentRun

      this.progressMeter.incStep(step.name)

      if (
        step.type === STEP_TYPE_SINGLE ||
        step.type === STEP_TYPE_SERVER_ONLY
      ) {
        // Single Step
        step.data = []
        step.environmentTestcase = []
        for (
          let tcCounter = 0;
          tcCounter < this.testcases.length;
          tcCounter++
        ) {
          const tc = this.testcases[tcCounter]
          const tcEnvId = this.environmentTestcaseIds[tcCounter]
          const tcEnv = this.environmentTestcaseMap.get(tcEnvId)
          this.progressMeter.incTestcase(tcEnv.name)

          if (tcEnv.running) {
            const data = tc.data[i]
            step.data.push(data)
            step.environmentTestcase.push(tcEnv)
          }
        }

        // there is data or it runs without data
        step.name = stepDefinition.name
        step.description = stepDefinition.description
        steps.push(step)
      } else {
        // Normal step
        for (
          let tcCounter = 0;
          tcCounter < this.testcases.length;
          tcCounter++
        ) {
          const tc = this.testcases[tcCounter]
          const tcEnvId = this.environmentTestcaseIds[tcCounter]
          const tcEnv = this.environmentTestcaseMap.get(tcEnvId)

          this.progressMeter.incTestcase(tcEnv.name)

          const data = tc.data[i]
          if (data !== undefined || step.needData === false) {
            // get the testcase environment for this step
            assert.ok(
              tcEnvId,
              `Could not get a testcase instance id for testcase '${tcCounter}'`
            )

            assert.ok(
              tcEnv,
              `Could not get a testcase environment for testcase instance id '${tcEnvId}'`
            )
            step.environmentTestcase = tcEnv
            // only execute steps for testcases which not have failed
            if (tcEnv.status < STATUS_ERROR && tcEnv.running) {
              step.countCurrent = i + 1
              step.countAll = stepCount
              step.name = stepDefinition.name
              step.description = stepDefinition.description
              step.data = data

              steps.push(step)
            }
            // create a new step instance for the next testcase
            step = this.stepRegistry.getStep(stepDefinition.class)
            step.testMode = testMode
            step.logAdapter = this
            step.environmentRun = this.environmentRun
          }
        }
      }
      await this._executeSteps(steps)
    }

    await this._closeTestcases()

    await this._logEndRun()
  }

  /**
   * ends all the testcases and writes the status to the logger
   */
  async _closeTestcases() {
    // -----------------------
    // if this was the last step for this test case, the test case could be finished
    // -----------------------
    const logPromisses = []
    for (const environmentTestcase of this.environmentTestcaseMap.values()) {
      if (this.environmentRun.status > STATUS_ERROR) {
        environmentTestcase.status = STATUS_UNKNOWN
      }
      environmentTestcase.running = false
      logPromisses.push(this._logTestcaseStatus(environmentTestcase))
    }
    return Promise.all(logPromisses)
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
        // Only execute the step if not failed
        if (
          stepInstance.type !== STEP_TYPE_NORMAL ||
          stepInstance.environmentTestcase.status < STATUS_ERROR
        ) {
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
                  return this.setStepFail(stepInstance, err)
                })
            })
          })

          promises.push(
            asyncArray.reduce((prev, curr) => {
              return prev.then(curr)
            }, Promise.resolve(1))
          )
        }
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
    // eslint-disable-next-line no-console
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
    envRun.map.set(DIR_BASE_DATA, this.dataDir)
    this.environmentRun = envRun

    const tcCountAll = suite.testcases.length
    let tcCountCurrent = 1
    // test case environments
    suite.testcases.forEach(tcDef => {
      const envTc = new EnvironmentTestcase()
      this.environmentTestcaseIds.push(envTc.id)
      this.environmentTestcaseMap.set(envTc.id, envTc)
      envTc.countAll = tcCountAll
      envTc.countCurrent = tcCountCurrent

      envTc.name = tcDef.name
      envTc.description = tcDef.description
      tcCountCurrent++
    })
  }

  /**
   * Logs the start of a run
   * @return promise {promise} A promise indicating when the log was written
   */
  _logStartRun() {
    const data = {
      message: 'Start Run',
      suite: this.name,
    }
    return generateLogs(
      this.environmentRun,
      undefined,
      this.logAdapter,
      data,
      LEVEL_INFO
    )
  }

  /**
   * Logs the end of a run
   * @return promise {promise} A promise indicating when the log was written
   */
  _logEndRun() {
    const data = {
      message: 'Stop Run',
      suite: this.name,
      status: this.environmentRun.status,
    }
    return generateLogs(
      this.environmentRun,
      undefined,
      this.logAdapter,
      data,
      LEVEL_INFO
    )
  }

  /**
   * Converts the logLevel into a Status
   * @param logLevel {string} The loglevel to be converted
   * @return status {number} The status
   */
  _getStatusForLoglevel(logeLevel) {
    if (logeLevel === LEVEL_WARNING) {
      return STATUS_WARNING
    } else if (logeLevel === LEVEL_ERROR) {
      return STATUS_ERROR
    } else if (logeLevel === LEVEL_FATAL) {
      return STATUS_FATAL
    }
    return STATUS_OK
  }

  /**
   * Logs an error of a step where the step throws an error.
   * Delegates the logging back to the step
   * @param stepInstance {object} The step object
   * @param err {object} The error caused by the step
   * @return promise {promise} A promise indicating when the log was written
   */
  setStepFail(stepInstance, err) {
    // Delegate the logging to the step
    return stepInstance._log(err, LEVEL_ERROR)
  }

  /**
   * The interface of the LogAdapter
   * The runner is the logger for a step. So the Runner could intercept
   * and set the status as needed.
   * In this case the method is called from the step. So all data is in the right
   * format.
   */
  log(logMessage) {
    const logLevel = logMessage.logLevel
    const promises = []
    const status = this._getStatusForLoglevel(logLevel)

    const envTc = this.environmentTestcaseMap.get(logMessage.meta.tc.id)
    if (status >= STATUS_ERROR) {
      // there is an error. The status must be set
      promises.push(this.setTestcaseFail(envTc, logMessage.data, status))
      promises.push(this.setRunFail(logMessage.data, status))
    } else {
      envTc.status = status
    }

    // Now call the logger
    promises.push(this.logAdapter.log(logMessage))

    return Promise.all(promises)
  }

  /**
   * Set the environmentTestcase.running to false and logs
   * testcase log
   * @param environmentTestcase {object} The testcase environment
   * @param err {object} The data to be logged
   * @return promises
   */
  async setTestcaseFail(environmentTestcase, err, status = STATUS_ERROR) {
    const promisses = []
    if (
      environmentTestcase.status < STATUS_ERROR &&
      environmentTestcase.running
    ) {
      environmentTestcase.status = status
      this.progressMeter.setFail()
      environmentTestcase.running = false

      promisses.push(
        generateLogs(
          this.environmentRun,
          environmentTestcase,
          this.logAdapter,
          err,
          LEVEL_ERROR
        )
      )

      // promisses.push(this._logTestcaseStatus(environmentTestcase))
    }

    return Promise.all(promisses)
  }

  /**
   * Set the environmentRun.running to false and logs
   * testcase log
   * @param environmentTestcase {object} The testcase environment
   * @param err {object} The data to be logged
   * @return promises
   */

  async setRunFail(err, status = STATUS_ERROR) {
    this.environmentRun.status = status

    return generateLogs(
      this.environmentRun,
      undefined,
      this.logAdapter,
      err,
      LEVEL_ERROR
    )
  }

  /**
   * Writes a test case status message for the given test case
   * @param environmentTestcase {object} The test case environment
   */
  _logTestcaseStatus(environmentTestcase) {
    return generateLogs(
      this.environmentRun,
      environmentTestcase,
      this.logAdapter,
      { message: 'Testcase status', status: environmentTestcase.status },
      LEVEL_INFO
    )
  }

  /**
   * This method checks if there are still test cases in Status < 'Error'
   * If no return true
   * @return shouldStop {boolean} true, if the suite should be stopped
   */
  _shoulStopRun() {
    if (this.environmentRun.status === STATUS_FATAL) {
      return true
    }

    for (const envTc of this.environmentTestcaseMap.values()) {
      if (envTc.running) {
        return false
      }
    }
    return true
  }
}
