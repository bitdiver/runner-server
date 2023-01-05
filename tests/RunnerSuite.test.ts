import fs from 'fs'
import path from 'path'
import util from 'util'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'

import { createRegistry } from './helper/helper'
import { Runner } from '../src/index'
import { getLogAdapterMemory } from '@bitdiver/logadapter'

const rm = util.promisify(rimraf)

const TIMEOUT = 1000000
const STEP_REGISTRY = createRegistry()
const LOG_ADAPTER = getLogAdapterMemory()
LOG_ADAPTER.level = 0

const VOLATILE = path.join(__dirname, 'volatile', 'RunnerSuite')
const FIXTURES = path.join(__dirname, 'fixtures', 'RunnerSuite')

beforeAll(async () => {
  await rm(VOLATILE)
  await mkdirp(VOLATILE)
})

test(
  'Run with file logAdapter',
  async () => {
    const fileNameSuite = path.join(FIXTURES, 'suite_normal.json')
    const fileNameLogExpected = path.join(FIXTURES, 'suite_normal_log.json')
    const fileNameLogActual = path.join(VOLATILE, 'suite_normal_log.json')

    const suiteDefiniton = JSON.parse(
      await fs.promises.readFile(fileNameSuite, 'utf8')
    )

    const runner = new Runner({
      id: 'myGreatId',
      dataDirectory: '',
      suite: suiteDefiniton,
      stepRegistry: STEP_REGISTRY,
      logAdapter: LOG_ADAPTER,
      parallelExecution: true
    })

    await runner.run()

    const runId = runner.environmentRun?.id as string
    const runLog = LOG_ADAPTER.logs[runId].logs
    const tcLog = LOG_ADAPTER.logs[runId].testcases

    const expectedLogRaw = await fs.promises.readFile(
      fileNameLogExpected,
      'utf8'
    )
    const expectedLog = JSON.parse(expectedLogRaw)

    // the file is only written to have a new master if something is changed in the test
    await fs.promises.writeFile(
      fileNameLogActual,
      JSON.stringify(tcLog, null, 2),
      'utf8'
    )

    expect(runLog).toEqual([
      {
        data: {
          message: 'Start Run',
          stepCount: 27,
          suite: 'suite name',
          testCaseCount: 3
        },
        logLevel: 'info'
      }
    ])

    expect(tcLog).toEqual(expectedLog)
  },
  TIMEOUT
)
