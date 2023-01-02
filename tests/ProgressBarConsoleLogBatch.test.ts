import { createSuite, createRegistry } from './helper/helper'
import { Runner, ProgressBarConsoleLogBatch } from '../src/index'
import { getLogAdapterMemory } from '@bitdiver/logadapter'

const logAdapter = getLogAdapterMemory()
const TIMEOUT = 1000000

logAdapter.level = 0

const registry = createRegistry()

const mockData: any = []
// eslint-disable-next-line no-console
console.log = jest.fn((val) => {
  mockData.push(val)
})

test(
  'Run with file logAdapter',
  async () => {
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
      dataDirectory: '',
      stepRegistry: registry,
      id: '0815',
      suite: suiteDefiniton,
      parallelExecution: options.parallelExecution,
      progressMeterBatch: new ProgressBarConsoleLogBatch()
    })
    await runner.run()

    expect(mockData).toEqual([
      '------------------------------------------------',
      '| Execute suite:           test suite 1',
      '| Total step count:        2',
      '| Total test case count:   30',
      '------------------------------------------------',
      '1/0 Step normal 30',
      '2/0 Step normal 30',
      '3/0 Step single 28',
      '4/0 Step normal 30',
      '5/0 Step normal 30',
      '6/0 Step normal 30',
      '7/0 Step single 28',
      '8/0 Step normal 30',
      '9/0 Step normal 30',
      '10/0 Step single 28',
      '11/0 Step normal 30',
      '12/0 Step normal 30',
      '13/0 Step normal 30',
      '14/0 Step normal 30',
      '15/0 Step normal 30',
      '16/0 Step normal 30',
      '17/0 Step normal 30',
      '18/0 Step normal 30',
      '19/0 Step normal 30',
      '20/0 Step normal 30',
      '21/0 Step normal 30',
      '22/0 Step single 28',
      '23/0 Step normal 30',
      '24/0 Step normal 30',
      '25/0 Step normal 30',
      '26/0 Step normal 30',
      '27/0 Step single 28',
      '28/0 Step normal 30',
      '29/0 Step normal 30',
      '------------------------------------------------',
      '| Result for suite:        ',
      '| Steps:                   29/0',
      '| Testcase:                30/0',
      '| Failed:                  0',
      '| Last step:               Step normal 30',
      '| Last test case:          ',
      '------------------------------------------------'
    ])
  },
  TIMEOUT
)
