/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { v4 as uuidv4 } from 'uuid'
import pAll from 'p-all'

import {
  getLogAdapterFile,
  LEVEL_ERROR,
  LEVEL_FATAL,
  LEVEL_INFO,
  LEVEL_WARNING,
  LogAdapterInterface
} from '@bitdiver/logadapter'
import {
  StepDefinitionInterface,
  SuiteDefinitionInterface,
  TestcaseDefinitionInterface,
  ExecutionModeType,
  EXECUTION_MODE_BATCH
} from '@bitdiver/definition'
import {
  EnvironmentRun,
  EnvironmentTestcase,
  generateLogs,
  STATUS_ERROR,
  STATUS_FATAL,
  STATUS_OK,
  STATUS_UNKNOWN,
  STATUS_WARNING,
  StepBase,
  StepRegistry,
  StepType,
  DIR_BASE_DATA
} from '@bitdiver/model'

import { ProgressMeterBatch } from './progress/ProgressMeterBatch'
import { ProgressMeterNormal } from './progress/ProgressMeterNormal'
import { StepSingleLocal } from '../tests/helper/StepSingle'
import { StepNormal } from '../tests/helper/StepNormal'
import { StepTree } from './steps/StepTree'
import { StepSorter } from './steps/StepSorter'

/** Defnes how the step instances are executed.  */
type stepExecutionMethodType =
  | '_executeStepMethodParallel'
  | '_executeStepMethodOrdered'

interface RunnerOptions {
  /** The run id. A unique Identifier for the run */
  id: string

  /**
   * The base directory for all the data files of the steps
   * It will be injected into the run environment
   */
  dataDirectory: string

  /** The suite to be executed */
  suite: SuiteDefinitionInterface

  /** The registry containing all the steps */
  stepRegistry: StepRegistry

  /** The progress meter for batch execution */
  progressMeterBatch?: ProgressMeterBatch

  /** The progress meter for normal execution */
  progressMeterNormal?: ProgressMeterNormal

  /** The LogAdapter for the execution */
  logAdapter?: LogAdapterInterface

  /** How many steps could be executed in parallel */
  maxParallelSteps?: number

  /** A descriotion for this run */
  description?: string

  /**
   * if true, the step instances of one step are exeuted in parallel, if set to
   * false they will be synchronously executed in the order of the test cases
   */
  parallelExecution?: boolean

  /**
   * When true, then the steps are executed in testMode. Else the steps are executed in
   * production mode
   */
  testMode?: boolean
}

/**
 * The runner executes a suite
 */
export class Runner {
  /** The run id. A unique Identifier for the run */
  id: string

  /**
   * The base directory for all the data files of the steps
   * It will be injected into the run environment
   */
  dataDirectory: string

  /** The name of the suite */
  name: string

  /** The progress meter for batch execution */
  progressMeterBatch: ProgressMeterBatch

  /** The progress meter for normal execution */
  progressMeterNormal: ProgressMeterNormal

  /** The LogAdapter for the execution */
  logAdapter: LogAdapterInterface

  /** How many steps could be executed in parallel */
  maxParallelSteps: number = 20

  /** The registry containing all the steps */
  stepRegistry: StepRegistry

  /** A descriotion for this run */
  description: string

  /** The run environment. This is available over all test cases and all steps */
  environmentRun?: EnvironmentRun

  /** Stores all the test case environment by there instance id */
  environmentTestcaseMap?: Map<string, EnvironmentTestcase>

  /** Stores the test case instance ids in the order of the testcase */
  environmentTestcaseIds?: string[]

  /** This object contaons all the steps by there stepId */
  steps: { [key: string]: StepDefinitionInterface }

  /** The array with all the test case definitions */
  testcases: TestcaseDefinitionInterface[]

  /** Defnes how the step instances are executed.  */
  stepExecutionMethod: stepExecutionMethodType = '_executeStepMethodParallel'

  /** The execution mode 'batch|normal' */
  executionMode: ExecutionModeType

  /**
   * When true, then the steps are executed in testMode. Else the steps are executed in
   * production mode
   */
  testMode: boolean = false

  constructor(opts: RunnerOptions) {
    this.dataDirectory = opts.dataDirectory ? opts.dataDirectory : ''

    this.progressMeterBatch = opts.progressMeterBatch
      ? opts.progressMeterBatch
      : new ProgressMeterBatch(opts.suite.name)

    this.progressMeterNormal = opts.progressMeterNormal
      ? opts.progressMeterNormal
      : new ProgressMeterNormal(opts.suite.name)

    this.logAdapter = opts.logAdapter ?? getLogAdapterFile()

    this.maxParallelSteps = opts.maxParallelSteps ? opts.maxParallelSteps : 20
    this.stepRegistry = opts.stepRegistry
    this.name = opts.suite.name
    this.description = opts.description ?? ''

    if (opts.parallelExecution !== undefined) {
      this.stepExecutionMethod = opts.parallelExecution
        ? '_executeStepMethodParallel'
        : '_executeStepMethodOrdered'
    }

    this.id = uuidv4()

    if (opts.testMode !== undefined) {
      this.testMode = opts.testMode
    }

    this.steps = opts.suite.steps
    this.testcases = opts.suite.testcases
    this.executionMode = opts.suite.executionMode

    this._createEnvironments(opts.suite)
  }

  /**
   * Executes the Suite
   */
  public async run(): Promise<void> {
    const stepCount = Object.keys(this.steps).length
    const testcaseCount = this.testcases.length
    this.progressMeterBatch.init({
      testcaseCount,
      stepCount,
      name: this.name
    })
    this.progressMeterBatch.clear()

    if (this.executionMode === EXECUTION_MODE_BATCH) {
      await this._doRunBatch()
    } else {
      await this._doRunNormal()
    }

    this.progressMeterBatch.done()
  }

  /**
   * Executes a Suiten in normal mode
   * Itearte the test cases and then the steps in each test case.
   * @param opts - Options for the execution.
   *        testmode=(true/false) Defines if the suite should be executed in testmode or not
   */
  protected async _doRunNormal(): Promise<void> {
    if (
      this.environmentTestcaseIds === undefined ||
      this.environmentTestcaseMap === undefined
    ) {
      throw new Error('environments are undefined.')
    }

    const testCaseCount = this.testcases.length

    // create the count of all steps over all test cases
    let stepCount = 0
    for (let tcCounter = 0; tcCounter < testCaseCount; tcCounter++) {
      stepCount += this.testcases[tcCounter].steps.length
    }

    await this._logStartRun({ testCaseCount, stepCount })

    // iterate test test cases
    for (let tcCounter = 0; tcCounter < testCaseCount; tcCounter++) {
      const tc = this.testcases[tcCounter]
      const stepCountTc = tc.steps.length // the count of steps in this test case

      // iterate steps of this particular test case
      for (let stepCounter = 0; stepCounter < stepCountTc; stepCounter++) {
        const stepId = tc.steps[stepCounter]
        const stepDefinition = this.steps[stepId]

        const step = this.stepRegistry.getStep(stepDefinition.id)
        step.name = stepDefinition.name
          ? stepDefinition.name
          : stepDefinition.id
        step.countCurrent = stepCounter + 1
        step.countAll = stepCountTc
        step.testMode = this.testMode
        step.logAdapter = this.logAdapter
        step.environmentRun = this.environmentRun

        const tcEnvId = this.environmentTestcaseIds[tcCounter]
        const tcEnv = this.environmentTestcaseMap.get(tcEnvId)
        step.environmentTestcase = tcEnv
        step.data = tc.data[stepCounter]

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!this._shouldStopRun() || tcEnv?.running || step.runOnError) {
          // OK the step should run
          await this._executeStepMethodOrdered([step], ['start'])
          await this._executeStepMethodOrdered([step], ['beforeRun', 'run'])
          await this._executeStepMethodOrdered([step], ['afterRun'])
          await this._executeStepMethodOrdered([step], ['end'])
        }
      }
    }
  }

  /**
   * Executes a Suiten in batch mode
   * Itearte the steps and then the test cases. Steps and test cases are a matrix
   * @param opts - Options for the execution.
   *        testmode=(true/false) Defines if the suite should be executed in testmode or not
   */
  protected async _doRunBatch(): Promise<void> {
    if (
      this.environmentTestcaseIds === undefined ||
      this.environmentTestcaseMap === undefined
    ) {
      throw new Error('environments are undefined.')
    }

    const stepCount = Object.keys(this.steps).length
    await this._logStartRun({ testCaseCount: this.testcases.length, stepCount })

    // To get all the step Ids we need to get alle the steps of each test case
    const stepIds = this.getAllStepIdsForBatchMode()

    // first iterate the steps and then the testscases
    for (let stepCounter = 0; stepCounter < stepIds.length; stepCounter++) {
      // if (this._shouldStopRun()) {
      //   // OK we can stop the run here
      //   break
      // }

      if (stepCounter > 0) {
        this.progressMeterBatch.startOverTestcase()
      }

      const stepId = stepIds[stepCounter]
      const stepDefinition = this.steps[stepId]

      const steps = []
      let step = this.stepRegistry.getStep(stepDefinition.id)
      step.name = stepDefinition.name ? stepDefinition.name : stepDefinition.id
      step.countCurrent = stepCounter + 1
      step.countAll = stepCount
      step.testMode = this.testMode
      step.logAdapter = this.logAdapter
      step.environmentRun = this.environmentRun

      if (stepCounter > 0) {
        this.progressMeterBatch.incStep(stepDefinition.name)
      }

      if (step.type === StepType.single) {
        const singleStep: StepSingleLocal = step as StepSingleLocal
        // Single Step
        singleStep.data = []
        singleStep.environmentTestcase = []
        for (
          let tcCounter = 0;
          tcCounter < this.testcases.length;
          tcCounter++
        ) {
          const tc = this.testcases[tcCounter]
          const tcEnvId = this.environmentTestcaseIds[tcCounter]
          const tcEnv = this.environmentTestcaseMap.get(tcEnvId)
          if (tcEnv === undefined) {
            throw new Error('Test case environment could not be found')
          }
          this.progressMeterBatch.incTestcase(tcEnv.name)

          if (tcEnv.running || singleStep.runOnError) {
            const data = tc.data[stepCounter]
            singleStep.data.push(data)
            singleStep.environmentTestcase.push(tcEnv)
          }
        }

        // there is data or it runs without data
        singleStep.name = stepDefinition.name
        singleStep.description = stepDefinition.description

        if (!this._shouldStopRun() || singleStep.runOnError) {
          // OK the step should run
          steps.push(singleStep)
        }
      } else {
        // Normal step
        const normalStep: StepNormal = step as StepNormal
        for (
          let tcCounter = 0;
          tcCounter < this.testcases.length;
          tcCounter++
        ) {
          const tc = this.testcases[tcCounter]
          const tcEnvId = this.environmentTestcaseIds[tcCounter]
          const tcEnv = this.environmentTestcaseMap.get(tcEnvId)
          if (tcEnv === undefined) {
            throw new Error('The test case Environment could not be found')
          }

          const data = tc.data[stepCounter]
          if ((data !== undefined && data !== null) || !normalStep.needData) {
            this.progressMeterBatch.incTestcase(tcEnv.name)

            normalStep.environmentTestcase = tcEnv
            // only execute steps for testcases which not have failed
            if (
              (tcEnv.status < STATUS_ERROR && tcEnv.running) ||
              (normalStep.runOnError && tcEnv.status < STATUS_FATAL)
            ) {
              normalStep.countCurrent = stepCounter + 1
              normalStep.countAll = stepCount
              normalStep.name = stepDefinition.name
              normalStep.description = stepDefinition.description
              normalStep.data = data

              steps.push(normalStep)
            }
            // create a new step instance for the next testcase
            step = this.stepRegistry.getStep(stepDefinition.id)
            normalStep.name = stepDefinition.name
              ? stepDefinition.name
              : stepDefinition.id
            normalStep.testMode = this.testMode
            normalStep.logAdapter = this.logAdapter
            normalStep.environmentRun = this.environmentRun
          } else {
            this.progressMeterBatch.incTestcase('')
          }
        }
      }

      if (steps.length > 0) {
        await this._executeSteps(steps)
      } else {
        // eslint-disable-next-line no-console
        console.log(`No instance of step '${step.name}'`)
      }
    }

    await this._closeTestcases()

    await this._logEndRun(this._getRunStatus())
  }

  protected getAllStepIdsForBatchMode(): string[] {
    const stepTree = new StepTree()

    this.testcases.forEach((tc) => {
      stepTree.add(tc.steps)
    })
    const stepSorter = new StepSorter(stepTree)
    return stepSorter.getSteps()
  }

  /**
   * Computes the status of this run and returns an object with the detail information
   * @returns status - An object with the status summary of this run
   */
  protected _getRunStatus(): any {
    if (
      this.environmentTestcaseIds === undefined ||
      this.environmentTestcaseMap === undefined
    ) {
      throw new Error('environments are undefined.')
    }

    const testCaseCount = this.testcases.length
    const stepCount = Object.keys(this.steps).length
    let fail = 0
    let unknown = 0
    let warn = 0
    let pass = 0

    for (const tcEnvId of this.environmentTestcaseIds) {
      const tcEnv = this.environmentTestcaseMap.get(tcEnvId)
      if (tcEnv === undefined) {
        throw new Error('The test case envrionment could not be found')
      }

      if (tcEnv.status === STATUS_WARNING) {
        warn++
      } else if (tcEnv.status === STATUS_ERROR) {
        fail++
      } else if (tcEnv.status === STATUS_FATAL) {
        fail++
      } else if (tcEnv.status === STATUS_OK) {
        pass++
      } else if (tcEnv.status === STATUS_UNKNOWN) {
        unknown++
      }
    }
    return { testCaseCount, stepCount, status: { fail, unknown, warn, pass } }
  }

  /**
   * ends all the testcases and writes the status to the logger
   */
  protected async _closeTestcases(): Promise<void> {
    if (
      this.environmentRun === undefined ||
      this.environmentTestcaseIds === undefined ||
      this.environmentTestcaseMap === undefined
    ) {
      throw new Error('environments are undefined.')
    }
    // -----------------------
    // if this was the last step for this test case, the test case could be finished
    // -----------------------
    const logPromisses = []
    for (const environmentTestcase of this.environmentTestcaseMap.values()) {
      if (
        this.environmentRun.status === STATUS_FATAL &&
        environmentTestcase.status < STATUS_ERROR
      ) {
        // The run aborted due to some error end the testcase was not yet finished
        environmentTestcase.status = STATUS_UNKNOWN
      }
      environmentTestcase.running = false
      logPromisses.push(this._logTestcaseStatus(environmentTestcase))
    }
    await Promise.all(logPromisses)
  }

  /**
   * Executes the given steps
   * @param stepInstances - An array of loaded steps to be executed
   *  The instances are the instances per testcase for one real step
   */
  protected async _executeSteps(stepInstances: StepBase[]): Promise<void> {
    await this[this.stepExecutionMethod](stepInstances, ['start'])
    await this[this.stepExecutionMethod](stepInstances, [
      'beforeRun',
      'run',
      'afterRun'
    ])
    await this[this.stepExecutionMethod](stepInstances, ['end'])
  }

  /**
   * Execute all instances of one Step.
   * This method could execute the instances in parallel.
   * @param stepInstances - An array of step instances. One instance per testcase
   * @param methods - An array of methods which should be executed on each step instance.
   *                        The methods will be executed in the given order
   */
  protected async _executeStepMethodParallel(
    stepInstances: StepBase[],
    methods: any[]
  ): Promise<void> {
    let maxParallelSteps = this.maxParallelSteps
    if (
      stepInstances[0].maxParallelSteps !== undefined &&
      stepInstances[0].maxParallelSteps < maxParallelSteps
    ) {
      maxParallelSteps = stepInstances[0].maxParallelSteps
    }

    const promiseFunctions = []
    for (const stepInstance of stepInstances) {
      promiseFunctions.push(
        async () => await this._getMethodPromise(stepInstance, methods)
      )
    }
    await pAll(promiseFunctions, { concurrency: maxParallelSteps })
  }

  /**
   * Submethod of _executeStepMethodParallel
   * This method build a promise which executes the given methods in
   * the given order
   */
  protected async _getMethodPromise(
    stepInstance: StepBase,
    methods: string[]
  ): Promise<void> {
    const asyncArray = []

    for (const method of methods) {
      asyncArray.push(async () => {
        await stepInstance.logInfo(`Step ${method}`)
      })

      asyncArray.push(async () => {
        stepInstance[method as keyof StepBase]().catch(async (err: any) => {
          await this.setStepFail(stepInstance, err)
        })
      })
    }

    for (const functionPromise of asyncArray) {
      try {
        await functionPromise
      } catch (e) {
        // do nothing
      }
    }

    // await asyncArray.reduce(async (prev, curr) => {
    //   return await prev.then(curr)
    // }, Promise.resolve(1))
  }

  /**
   * Execute all instances of one Step.
   * This method will execute the steps always in the same order.
   * @param stepInstances - An array of step instances. One instance per testcase
   * @param methods - An array of methods which should be executed on each step instance.
   *                        The methods will be executed in the given order
   */
  protected async _executeStepMethodOrdered(
    stepInstances: StepBase[],
    methods: string[]
  ): Promise<void> {
    for (const stepInstance of stepInstances) {
      try {
        for (const method of methods) {
          await stepInstance.logInfo(`Step ${method}`)
          await stepInstance[method as keyof StepBase]()
        }
      } catch (err) {
        await this.setStepFail(stepInstance, err)
      }
    }
  }

  /**
   * Creates the run environment ans all the testcase environments
   * @param suite - The suite definition to be executed
   */
  protected _createEnvironments(suite: SuiteDefinitionInterface): void {
    this.environmentTestcaseIds = []
    this.environmentTestcaseMap = new Map()

    // Run environment
    const envRun = new EnvironmentRun()
    envRun.name = suite.name
    envRun.description = suite.description
    envRun.map.set(DIR_BASE_DATA, this.dataDirectory)
    this.environmentRun = envRun

    const tcCountAll = suite.testcases.length
    let tcCountCurrent = 1
    // test case environments

    for (const tescaseDefinition of suite.testcases) {
      const envTc = new EnvironmentTestcase()
      this.environmentTestcaseIds.push(envTc.id)
      this.environmentTestcaseMap.set(envTc.id, envTc)
      envTc.countAll = tcCountAll
      envTc.countCurrent = tcCountCurrent

      envTc.name = tescaseDefinition.name
      envTc.description = tescaseDefinition.description ?? ''
      tcCountCurrent++
    }
  }

  /**
   * Logs the start of a run
   */
  protected async _logStartRun(opts = {}): Promise<void> {
    if (this.environmentRun === undefined) {
      throw new Error('The EnvironmentRun is undefined')
    }
    const data = {
      message: 'Start Run',
      suite: this.name,
      ...opts
    }
    await generateLogs({
      environmentRun: this.environmentRun,
      logAdapter: this.logAdapter,
      messageObj: data,
      logLevelString: LEVEL_INFO
    })
  }

  /**
   * Logs the end of a run
   */
  protected async _logEndRun(opts = {}): Promise<void> {
    if (this.environmentRun === undefined) {
      throw new Error('The EnvironmentRun is undefined')
    }
    const data = {
      message: 'Stop Run',
      suite: this.name,
      status: this.environmentRun.status,
      ...opts
    }
    await generateLogs({
      environmentRun: this.environmentRun,
      logAdapter: this.logAdapter,
      messageObj: data,
      logLevelString: LEVEL_INFO
    })
  }

  /**
   * Converts the logLevel into a Status
   * @param logLevel - The loglevel to be converted
   * @returns status - The status
   */
  protected _getStatusForLoglevel(logeLevel: string): number {
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
   * @param stepInstance - The step object
   * @param err - The error caused by the step
   */
  public async setStepFail(
    stepInstance: StepBase,
    err: any = 'Unknown Message: Empty error from step execution'
  ): Promise<void> {
    // Delegate the logging to the step
    await stepInstance._log(err, LEVEL_ERROR)
  }

  /**
   * The interface of the LogAdapter
   * The runner is the logger for a step. So the Runner could intercept
   * and set the status as needed.
   * In this case the method is called from the step. So all data is in the right
   * format.
   * @param logMessage - The data to be logged
   */
  public async log(logMessage: any): Promise<void> {
    if (
      this.environmentTestcaseIds === undefined ||
      this.environmentTestcaseMap === undefined
    ) {
      throw new Error('environments are undefined.')
    }

    const logLevel = logMessage.logLevel
    const promises = []
    const status = this._getStatusForLoglevel(logLevel)

    const envTc = this.environmentTestcaseMap.get(logMessage.meta.tc.id)
    if (envTc === undefined) {
      throw new Error('The test case envrionment could not be found')
    }

    if (status >= STATUS_ERROR) {
      // there is an error. The status must be set
      promises.push(this.setTestcaseFail(envTc, logMessage.data, status))
      promises.push(this.setRunFail(logMessage.data, status))
    } else {
      envTc.status = status
    }

    // Now call the logger
    promises.push(this.logAdapter.log(logMessage))

    await Promise.all(promises)
  }

  /**
   * Set the environmentTestcase.running to false and logs
   * testcase log
   * @param environmentTestcase - The testcase environment
   * @param messageObj - The data to be logged
   * @param status - The Status of this message. Defaul is ERROR
   */
  public async setTestcaseFail(
    environmentTestcase: EnvironmentTestcase,
    messageObj: any,
    status = STATUS_ERROR
  ): Promise<void> {
    if (this.environmentRun === undefined) {
      throw new Error('The EnvironmentRun is undefined')
    }
    const promisses = []
    if (
      environmentTestcase.status < STATUS_ERROR &&
      environmentTestcase.running
    ) {
      environmentTestcase.status = status
      this.progressMeterBatch.setFail()
      environmentTestcase.running = false

      promisses.push(
        generateLogs({
          environmentRun: this.environmentRun,
          environmentTestcase,
          logAdapter: this.logAdapter,
          messageObj,
          logLevelString: LEVEL_ERROR
        })
      )

      // promisses.push(this._logTestcaseStatus(environmentTestcase))
    }

    await Promise.all(promisses)
  }

  /**
   * Set the environmentRun.running to false and logs
   * testcase log
   * @param messageObj - The data to be logged
   * @param status - The Status of this message. Defaul is ERROR
   */

  public async setRunFail(
    messageObj: any,
    status: number = STATUS_ERROR
  ): Promise<void> {
    if (this.environmentRun === undefined) {
      throw new Error('The EnvironmentRun is undefined')
    }
    this.environmentRun.status = status

    await generateLogs({
      environmentRun: this.environmentRun,
      environmentTestcase: undefined,
      logAdapter: this.logAdapter,
      messageObj,
      logLevelString: LEVEL_ERROR
    })
  }

  /**
   * Writes a test case status message for the given test case
   * @param environmentTestcase - The test case environment
   */
  protected async _logTestcaseStatus(
    environmentTestcase: EnvironmentTestcase
  ): Promise<void> {
    if (this.environmentRun === undefined) {
      throw new Error('The EnvironmentRun is undefined')
    }
    await generateLogs({
      environmentRun: this.environmentRun,
      environmentTestcase,
      logAdapter: this.logAdapter,
      messageObj: {
        message: 'Testcase status',
        status: environmentTestcase.status
      },
      logLevelString: LEVEL_INFO
    })
  }

  /**
   * This method checks if there are still test cases in Status less than 'Error'
   * If no return true
   * @returns shouldStop - true, if the suite should be stopped
   */
  protected _shouldStopRun(): boolean {
    if (
      this.environmentRun === undefined ||
      this.environmentTestcaseMap === undefined
    ) {
      throw new Error('environments are undefined.')
    }

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
