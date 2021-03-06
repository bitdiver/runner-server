import { createSuite, createRegistry } from './helper/helper'
import { Runner } from '../src/index'
import { ProgressBarConsoleLogBatch } from '../src/index'
import { getLogAdapterMemory, getLogAdapterFile } from '@bitdiver/logadapter'

const logAdapter = getLogAdapterMemory()
const logAdapterFile = getLogAdapterFile()
const TIMEOUT = 1000000

logAdapter.level = 0

const registry = createRegistry()

test(
  'Run with file logAdapter',
  async (done) => {
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
      progressMeterBatch: new ProgressBarConsoleLogBatch(),
    })
    await runner.run(suiteDefiniton)

    done()
  },
  TIMEOUT
)
