import { createSuite, createRegistry } from './helper/helper'
import { Runner } from '../lib/index'

import {
  getLogAdapter as getLogAdapterArango,
  clearDatabase,
} from '@bitdiver/logadapter-arangodb'
import { getLogAdapter as getLogAdapterDispatcher } from '@bitdiver/logadapter-dispatcher'
import { getLogAdapterConsole } from '@bitdiver/logadapter'
import { retrieveData } from './arangoHelper'

debugger

const logAdapterArango = getLogAdapterArango()
const logAdapterConsole = getLogAdapterConsole()
const logAdapter = getLogAdapterDispatcher({
  logAdapterList: [logAdapterArango, logAdapterConsole],
})

const TIMEOUT = 1000000
const registry = createRegistry()

logAdapter.level = 0

test.only(
  'Run normal without any errors (Parallel Execution)',
  async done => {
    logAdapter.reset()
    await clearDatabase(logAdapterArango.db)

    await runTestcaseNoErrors({ parallelExecution: true, min: 1000, max: 2000 })

    const res = await retrieveData(logAdapterArango.db)
    console.log(res)

    done()
  },
  TIMEOUT
)

test(
  'Run test case with exception (Parallel Execution)',
  async done => {
    logAdapter.reset()
    await clearDatabase(logAdapterArango.db)

    await runTestcaseHasStatusException({
      parallelExecution: true,
      extendedRes: true,
    })

    const res = await retrieveData(logAdapterArango.db)
    console.log(res)

    // expect(res).toEqual({
    //   'TC 1': {
    //     logCount: 1,
    //     status: 1,
    //     stepCount: 5,
    //   },
    //   'TC 2': {
    //     logCount: 2,
    //     status: 4,
    //     stepCount: 1,
    //   },
    //   'TC 3': {
    //     logCount: 1,
    //     status: 1,
    //     stepCount: 5,
    //   },
    // })
    done()
  },
  TIMEOUT
)

// test(
//   'Run test case with status fatal (Parallel Execution)',
//   async done => {
//     await runTestcaseAll({
//       parallelExecution: false,
//       extendedRes: true,
//       posTc: 1, // The tc where to store the action
//       posStep: 0, // The step where to store the action
//       action: 'logFatal', // The action of the testcase data
//       value: 'FATAL', // The value for the action
//     })
//
//     // await logAdapter.writeFile('log/runlog.json')
//     expect(res).toEqual({
//       'TC 1': { logCount: 1, status: 2, stepCount: 4 },
//       'TC 2': { logCount: 2, status: 5, stepCount: 1 },
//       'TC 3': { logCount: 1, status: 2, stepCount: 4 },
//     })
//     done()
//   },
//   TIMEOUT
// )
//
// test(
//   'Run test case with status error on single step (Parallel Execution)',
//   async done => {
//     await runTestcaseAll({
//       parallelExecution: true,
//       extendedRes: true,
//       posTc: 1, // The tc where to store the action
//       posStep: 1, // The step where to store the action
//       action: 'logError', // The action of the testcase data
//       value: 'ERROR Single', // The value for the action
//     })
//
//     // await logAdapter.writeFile('log/runlog.json')
//
//     expect(res).toEqual({
//       'TC 1': {
//         logCount: 2,
//         status: 4,
//         stepCount: 2,
//       },
//       'TC 2': {
//         logCount: 2,
//         status: 4,
//         stepCount: 2,
//       },
//       'TC 3': {
//         logCount: 2,
//         status: 4,
//         stepCount: 2,
//       },
//     })
//     done()
//   },
//   TIMEOUT
// )

/**
 * Runs a normal suite without any errors
 */
async function runTestcaseNoErrors(opts = {}) {
  const options = { ...opts, action: 'unknown', value: 'unknown' }
  await runTestcaseAll(options)
}

/**
 * Runs a normal suite with an exception
 */
async function runTestcaseHasStatusException(opts = {}) {
  const options = { ...opts, action: 'exception', value: 'Uhhh very bad' }
  await runTestcaseAll(options)
}

/**
 * Runs a normal suite with a status Warning
 */
async function runTestcaseAll(opts = {}) {
  const options = {
    parallelExecution: true,
    posTc: 1, // The tc where to store the action
    posStep: 0, // The step where to store the action
    extendedRes: false, // should create extended log result?
    action: 'unknown', // The action of the testcase data
    value: 'unknown', // The value for the action
    min: 5,
    max: 100,
    ...opts,
  }
  logAdapter.reset()
  const suiteDefiniton = createSuite()
  console.log(suiteDefiniton)
  const data = {
    run: {
      action: options.action,
      value: options.value,
      min: options.min,
      max: options.max,
    },
  }
  suiteDefiniton.testcases[options.posTc].data[options.posStep] = data

  const runner = new Runner({
    stepRegistry: registry,
    logAdapter,
    parallelExecution: options.parallelExecution,
  })
  await runner.run(suiteDefiniton)
}
