import { createSuite, createRegistry } from './helper/helper'
import { Runner, ProgressBarConsoleLogBatchJson } from '../src/index'
import { getLogAdapterMemory } from '@bitdiver/logadapter'

const logAdapter = getLogAdapterMemory()
const TIMEOUT = 1000000
const registry = createRegistry()

logAdapter.level = 0

test(
  'Run with file logAdapter',
  async () => {
    const options = {
      parallelExecution: true,
      posTc: 1, // The tc where to store the action
      posStep: 0, // The step where to store the action
      extendedRes: true, // should create extended log result?
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
      dataDirectory: '',
      stepRegistry: registry,
      id: '0815',
      suite: suiteDefiniton,
      parallelExecution: options.parallelExecution,
      progressMeterBatch: new ProgressBarConsoleLogBatchJson({ name: 'demo' })
    })
    await runner.run()
  },
  TIMEOUT
)
