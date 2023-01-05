import fs from 'fs'
import path from 'path'
import util from 'util'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { createSuite, createRegistry } from './helper/helper'
import { Runner, ProgressBarConsoleLogBatchJson } from '../src/index'
import { getLogAdapterMemory } from '@bitdiver/logadapter'

const rm = util.promisify(rimraf)

const FIXTURES = path.join(__dirname, 'fixtures', 'progressBarBatchJson')
const VOLATILE = path.join(__dirname, 'volatile', 'progressBarBatchJson')

const logAdapter = getLogAdapterMemory()
const TIMEOUT = 1000000
const registry = createRegistry()

logAdapter.level = 0

const mockData: any = []
// eslint-disable-next-line no-console
console.log = jest.fn((val) => {
  mockData.push(JSON.parse(val))
})

beforeAll(async () => {
  await rm(VOLATILE)
  await mkdirp(VOLATILE)
})

test(
  'Run with file logAdapter',
  async () => {
    const fileNameExpected = path.join(FIXTURES, 'expectedLog.json')
    const fileNameActual = path.join(VOLATILE, 'expectedLog.json')
    const expected = JSON.parse(
      await fs.promises.readFile(fileNameExpected, 'utf8')
    )

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

    await fs.promises.writeFile(
      fileNameActual,
      JSON.stringify(mockData, null, 2),
      'utf8'
    )

    expect(mockData).toEqual(expected)
  },
  TIMEOUT
)
