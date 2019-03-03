import fs from 'fs'
import util from 'util'
import path from 'path'

import { createRegistry } from './helper/helper'
import { Runner } from '../lib/index'
import { getLogAdapterMemory } from '@bitdiver/logadapter'
import { loadSuite } from '@bitdiver/definition'

const TIMEOUT = 1000000
const STEP_REGISTRY = createRegistry()
const LOG_ADAPTER = getLogAdapterMemory()
LOG_ADAPTER.level = 0

const VOLATILE = path.join(__dirname, 'volatile')
const FIXTURES = path.join(__dirname, 'fixtures')
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

test(
  'Run with file logAdapter',
  async done => {
    const fileNameSuite = 'suite_normal.json'
    const fileNameLog = 'suite_normal_log.json'

    const suiteDefiniton = await loadSuite(path.join(FIXTURES, fileNameSuite))

    const runner = new Runner({
      stepRegistry: STEP_REGISTRY,
      logAdapter: LOG_ADAPTER,
      parallelExecution: true,
    })

    await runner.run(suiteDefiniton)

    const runId = runner.environmentRun.id
    const runLog = LOG_ADAPTER.logs[runId].logs
    const tcLog = LOG_ADAPTER.logs[runId].testcases

    const expectedLogRaw = await readFile(path.join(FIXTURES, fileNameLog))
    const expectedLog = JSON.parse(expectedLogRaw)


    // the file is only written to have a new master if something is changed in the test
    await writeFile(
      path.join(VOLATILE, fileNameLog),
      JSON.stringify(tcLog, null, 2)
    )

    expect(runLog).toEqual([
      {
        data: {
          message: 'Start Run',
          stepCount: 27,
          suite: 'suite name',
          testCaseCount: 3,
        },
        logLevel: 'info',
      },
    ])

    expect(tcLog).toEqual(expectedLog)

    done()
  },
  TIMEOUT
)
