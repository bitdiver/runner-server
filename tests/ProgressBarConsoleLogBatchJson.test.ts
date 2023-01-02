import { createSuite, createRegistry } from './helper/helper'
import { Runner, ProgressBarConsoleLogBatchJson } from '../src/index'
import { getLogAdapterMemory } from '@bitdiver/logadapter'

const logAdapter = getLogAdapterMemory()
const TIMEOUT = 1000000
const registry = createRegistry()

logAdapter.level = 0

const mockData: any = []
// eslint-disable-next-line no-console
console.log = jest.fn((val) => {
  mockData.push(JSON.parse(val))
})

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

    for (const entry of mockData) {
      delete entry.meta.logTime
      delete entry.meta.logTimeString
    }
    expect(mockData).toEqual([
      {
        data: {
          'Execute suite': 'test suite 1',
          'Total step count': '2',
          'Total test case count': '30'
        },
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 0
        }
      },
      {
        data: '1/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 1
        }
      },
      {
        data: '2/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 2
        }
      },
      {
        data: '3/0 Step single 28',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 3
        }
      },
      {
        data: '4/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 4
        }
      },
      {
        data: '5/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 5
        }
      },
      {
        data: '6/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 6
        }
      },
      {
        data: '7/0 Step single 28',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 7
        }
      },
      {
        data: '8/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 8
        }
      },
      {
        data: '9/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 9
        }
      },
      {
        data: '10/0 Step single 28',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 10
        }
      },
      {
        data: '11/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 11
        }
      },
      {
        data: '12/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 12
        }
      },
      {
        data: '13/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 13
        }
      },
      {
        data: '14/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 14
        }
      },
      {
        data: '15/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 15
        }
      },
      {
        data: '16/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 16
        }
      },
      {
        data: '17/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 17
        }
      },
      {
        data: '18/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 18
        }
      },
      {
        data: '19/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 19
        }
      },
      {
        data: '20/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 20
        }
      },
      {
        data: '21/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 21
        }
      },
      {
        data: '22/0 Step single 28',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 22
        }
      },
      {
        data: '23/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 23
        }
      },
      {
        data: '24/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 24
        }
      },
      {
        data: '25/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 25
        }
      },
      {
        data: '26/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 26
        }
      },
      {
        data: '27/0 Step single 28',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 27
        }
      },
      {
        data: '28/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 28
        }
      },
      {
        data: '29/0 Step normal 30',
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 29
        }
      },
      {
        data: {
          Failed: '0',
          'Last step': 'Step normal 30',
          'Last test case': '',
          'Result for suite': '',
          Steps: '29/0',
          Testcase: '30/0'
        },
        meta: {
          logTyp: 'ProgressBarConsole',
          sequence: 30
        }
      }
    ])
  },
  TIMEOUT
)
