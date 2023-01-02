import { createRegistry } from './helper/helper'
import { Runner } from '../src/index'
import { LogAdapterMemory } from '@bitdiver/logadapter'
import {
  StepDefinitionInterface,
  SuiteDefinitionInterface,
  TestcaseDefinitionInterface
} from '@bitdiver/definition'

const TIMEOUT = 1000000
const registry = createRegistry()

const mockData: any = []
// eslint-disable-next-line no-console
console.log = jest.fn((val) => {
  mockData.push(val)
})

test(
  'Run in batch mode',
  async () => {
    const logAdapter = new LogAdapterMemory({ logLevel: 'debug' })
    const suiteDefiniton = SUITE_DEFINITION

    const runner = new Runner({
      id: 'myGreatId',
      dataDirectory: '',
      suite: suiteDefiniton,
      stepRegistry: registry,
      logAdapter,
      parallelExecution: true
    })

    await runner.run()
    // no check the log status
    const res = checkTcStatus(true, logAdapter)

    expect(mockData).toEqual([])
    expect(res).toEqual({})
  },
  TIMEOUT
)

interface TcStatusResult {
  status: any
  logCount: number
  stepCount: number
}

interface CheckTcStatusResult {
  [key: string]: TcStatusResult
}

/**
 * Extract the status for each test case from the logger
 * and returns an object with the status per testcase
 */
function checkTcStatus(
  extended = false,
  logAdapter: LogAdapterMemory
): CheckTcStatusResult {
  const runIds = Object.keys(logAdapter.logs)
  expect(runIds.length).toBe(1) // There should be one run only

  const res: CheckTcStatusResult = {}
  const tcNames = Object.keys(logAdapter.logs[runIds[0]].testcases)
  tcNames.forEach((tcName) => {
    // get the test case log part
    const tcLog = logAdapter.logs[runIds[0]].testcases[tcName]

    // there must be at least one entry with the status
    expect(tcLog.logs.length).toBeGreaterThan(0)

    // The last log of a test case must be the status log
    const statusLog = tcLog.logs[tcLog.logs.length - 1]

    expect(statusLog.data.message).toEqual('Testcase status')

    if (extended) {
      res[tcName] = {
        status: statusLog.data.status,
        logCount: tcLog.logs.length,
        stepCount: Object.keys(tcLog.steps).length
      }
    } else {
      res[tcName] = statusLog.data.status
    }
  })

  return res
}

const STEPS: { [key: string]: StepDefinitionInterface } = {
  'step 1': {
    id: 'normal',
    name: 'step 1',
    description: 'description for step 1'
  },

  'step 2': {
    id: 'normal',
    name: 'step 2',
    description: 'description for step 2'
  },

  'step 3': {
    id: 'normal',
    name: 'step 3',
    description: 'description for step 3'
  },

  'step 4': {
    id: 'normal',
    name: 'step 4',
    description: 'description for step 4'
  },
  'step 5': {
    id: 'normal',
    name: 'step 5',
    description: 'description for step 5'
  },
  'step 6': {
    id: 'normal',
    name: 'step 6',
    description: 'description for step 6'
  }
}

const TEST_CASES: TestcaseDefinitionInterface[] = [
  {
    name: 'TC 1',
    data: ['data 4', 'data 5', 'data 6'],
    steps: ['step 4', 'step 5', 'step 6']
  },
  {
    name: 'TC 2',
    data: ['data 1', 'data 2', 'data 3'],
    steps: ['step 1', 'step 2', 'step 3']
  },

  {
    name: 'TC 3',
    data: ['data 1', 'data 3', 'data 5'],
    steps: ['step 1', 'step 3', 'step 5']
  },
  {
    name: 'TC 4',
    data: ['data 1', 'data 2', 'data 3'],
    steps: ['step 1', 'step 2', 'step 3']
  },
  {
    name: 'TC 5',
    data: ['data 1', 'data 2', 'data 3', 'data 4'],
    steps: ['step 1', 'step 2', 'step 3', 'step 4']
  },
  {
    name: 'TC 6',
    data: ['data 1', 'data 9'],
    steps: ['step 1', 'step 9']
  }
]

const SUITE_DEFINITION: SuiteDefinitionInterface = {
  executionMode: 'batch',
  name: 'Super Suite',
  description: 'my great suite description',
  tags: ['tag-1', 'tag-2'],
  steps: STEPS,
  testcases: TEST_CASES
}
