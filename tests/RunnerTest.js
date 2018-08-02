import { createSuite, createRegistry } from './helper/helper'
import { Runner, getLogAdapter } from '../lib/index'
// import { getLogAdapter } from '../lib/index'
import { getLogAdapterMemory } from '@bitdiver/model'

import { StepDefinition } from '@bitdiver/definition'

const logAdapter = getLogAdapterMemory()
const logAdapterFile = getLogAdapter()
const TIMEOUT = 1000000
const registry = createRegistry()

test(
  'Run with file logAdapter',
  async done => {
    const options = {
      parallelExecution: true,
      posTc: 1, // The tc where to store the action
      posStep: 0, // The step where to store the action
      extendedRes: false, // should create extended log result?
      action: 'unknown', // The action of the testcase data
      value: 'unknown', // The value for the action
    }

    const suiteDefiniton = createSuite()

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
    })
    await runner.run(suiteDefiniton)

    done()
  },
  TIMEOUT
)

test(
  'Run normal without any errors (Parallel Execution)',
  async done => {
    const res = await runTestcaseNoErrors({ parallelExecution: true })
    expect(res).toEqual({
      'TC 1': 1,
      'TC 2': 1,
      'TC 3': 1,
    })
    done()
  },
  TIMEOUT
)

test(
  'Run normal without any errors (Linear Execution)',
  async done => {
    const res = await runTestcaseNoErrors({ parallelExecution: false })
    expect(res).toEqual({
      'TC 1': 1,
      'TC 2': 1,
      'TC 3': 1,
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with status warning (Parallel Execution)',
  async done => {
    const res = await runTestcaseHasStatusWarning({ parallelExecution: true })
    expect(res).toEqual({
      'TC 1': 1,
      'TC 2': 3,
      'TC 3': 1,
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with status warning (Linear Execution)',
  async done => {
    const res = await runTestcaseHasStatusWarning({ parallelExecution: false })
    expect(res).toEqual({
      'TC 1': 1,
      'TC 2': 3,
      'TC 3': 1,
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with status error (Parallel Execution)',
  async done => {
    const res = await runTestcaseHasStatusError({ parallelExecution: true })
    expect(res).toEqual({
      'TC 1': 1,
      'TC 2': 4,
      'TC 3': 1,
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with status error (Linear Execution)',
  async done => {
    const res = await runTestcaseHasStatusError({ parallelExecution: false })
    expect(res).toEqual({
      'TC 1': 1,
      'TC 2': 4,
      'TC 3': 1,
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with exception (Parallel Execution)',
  async done => {
    const res = await runTestcaseHasStatusException({
      parallelExecution: true,
      extendedRes: true,
    })
    expect(res).toEqual({
      'TC 1': {
        logCount: 1,
        status: 1,
        stepCount: 5,
      },
      'TC 2': {
        logCount: 2,
        status: 4,
        stepCount: 1,
      },
      'TC 3': {
        logCount: 1,
        status: 1,
        stepCount: 5,
      },
    })
    done()
  },
  TIMEOUT
)
test(
  'Run test case with exception (Linear Execution)',
  async done => {
    const res = await runTestcaseHasStatusException({
      parallelExecution: false,
      extendedRes: true,
    })
    expect(res).toEqual({
      'TC 1': {
        logCount: 1,
        status: 1,
        stepCount: 5,
      },
      'TC 2': {
        logCount: 2,
        status: 4,
        stepCount: 1,
      },
      'TC 3': {
        logCount: 1,
        status: 1,
        stepCount: 5,
      },
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with status fatal (Parallel Execution)',
  async done => {
    const res = await runTestcaseAll({
      parallelExecution: false,
      extendedRes: true,
      posTc: 1, // The tc where to store the action
      posStep: 0, // The step where to store the action
      action: 'logFatal', // The action of the testcase data
      value: 'FATAL', // The value for the action
    })

    // await logAdapter.writeFile('log/runlog.json')
    expect(res).toEqual({
      'TC 1': { logCount: 1, status: 2, stepCount: 4 },
      'TC 2': { logCount: 2, status: 5, stepCount: 1 },
      'TC 3': { logCount: 1, status: 2, stepCount: 4 },
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with status fatal (Linear Execution)',
  async done => {
    const res = await runTestcaseAll({
      parallelExecution: false,
      extendedRes: true,
      posTc: 1, // The tc where to store the action
      posStep: 0, // The step where to store the action
      action: 'logFatal', // The action of the testcase data
      value: 'FATAL', // The value for the action
    })

    expect(res).toEqual({
      'TC 1': { logCount: 1, status: 2, stepCount: 4 },
      'TC 2': { logCount: 2, status: 5, stepCount: 1 },
      'TC 3': { logCount: 1, status: 2, stepCount: 4 },
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with status error on single step (Parallel Execution)',
  async done => {
    const res = await runTestcaseAll({
      parallelExecution: true,
      extendedRes: true,
      posTc: 1, // The tc where to store the action
      posStep: 1, // The step where to store the action
      action: 'logError', // The action of the testcase data
      value: 'ERROR Single', // The value for the action
    })

    // await logAdapter.writeFile('log/runlog.json')

    expect(res).toEqual({
      'TC 1': {
        logCount: 2,
        status: 4,
        stepCount: 2,
      },
      'TC 2': {
        logCount: 2,
        status: 4,
        stepCount: 2,
      },
      'TC 3': {
        logCount: 2,
        status: 4,
        stepCount: 2,
      },
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with status error on single step (Linear Execution)',
  async done => {
    const res = await runTestcaseAll({
      parallelExecution: false,
      extendedRes: true,
      posTc: 1, // The tc where to store the action
      posStep: 1, // The step where to store the action
      action: 'logError', // The action of the testcase data
      value: 'ERROR Single', // The value for the action
    })

    expect(res).toEqual({
      'TC 1': {
        logCount: 2,
        status: 4,
        stepCount: 2,
      },
      'TC 2': {
        logCount: 2,
        status: 4,
        stepCount: 2,
      },
      'TC 3': {
        logCount: 2,
        status: 4,
        stepCount: 2,
      },
    })
    done()
  },
  TIMEOUT
)

test(
  'Run test case with step runOnError=true (Linear Execution)',
  async done => {
    const options = {
      parallelExecution: false,
      extendedRes: true,
      posTc: 1, // The tc where to store the action
      posStep: 1, // The step where to store the action
      action: 'logError', // The action of the testcase data
      value: 'ERROR Single', // The value for the action
    }

    logAdapter.clear()
    const suiteDefiniton = createSuite()

    const data = {
      run: {
        action: options.action,
        value: options.value,
      },
    }
    suiteDefiniton.testcases[options.posTc].data[options.posStep] = data

    const runOnErrorStep = new StepDefinition({
      class: 'runOnError',
      name: `Step single wich runs after Error`,
      description: `Desc for step`,
    })

    suiteDefiniton.steps[runOnErrorStep.id] = runOnErrorStep
    for (const tc of suiteDefiniton.testcases) {
      tc.data.push(undefined)
    }

    // The helper has added the same array to all the testcases,
    // so only push this additional once
    suiteDefiniton.testcases[0].steps.push(runOnErrorStep.id)

    const runner = new Runner({
      stepRegistry: registry,
      logAdapter,
      parallelExecution: options.parallelExecution,
    })

    await runner.run(suiteDefiniton)

    // no check the log status
    const res = checkTcStatus(options.extendedRes)

    expect(res).toEqual({
      'TC 1': { logCount: 2, status: 4, stepCount: 3 },
      'TC 2': { logCount: 2, status: 4, stepCount: 3 },
      'TC 3': { logCount: 2, status: 4, stepCount: 3 },
    })
    debugger
    const logs = runner.logAdapter.logs[runner.environmentRun.id].testcases
    expect(
      logs['TC 1'].steps['Step single wich runs after Error'].logs[2]
    ).toEqual({
      countAll: 6,
      countCurrent: 6,
      data: { message: 'Step run' },
      logLevel: 'info',
    })

    done()
  },
  TIMEOUT
)

/**
 * Runs a normal suite without any errors
 */
async function runTestcaseNoErrors(opts = {}) {
  const options = { ...opts, action: 'unknown', value: 'unknown' }
  return runTestcaseAll(options)
}

/**
 * Runs a normal suite with a status Warning
 */
async function runTestcaseHasStatusWarning(opts = {}) {
  const options = { ...opts, action: 'logWarning', value: 'WARN' }
  return runTestcaseAll(options)
}

/**
 * Runs a normal suite with a status Error
 */
async function runTestcaseHasStatusError(opts = {}) {
  const options = { ...opts, action: 'logError', value: 'ERROR' }
  return runTestcaseAll(options)
}

/**
 * Runs a normal suite with an exception
 */
async function runTestcaseHasStatusException(opts = {}) {
  const options = { ...opts, action: 'exception', value: 'Uhhh very bad' }
  return runTestcaseAll(options)
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
    ...opts,
  }

  logAdapter.clear()
  const suiteDefiniton = createSuite()

  const data = {
    run: {
      action: options.action,
      value: options.value,
    },
  }
  suiteDefiniton.testcases[options.posTc].data[options.posStep] = data

  const runner = new Runner({
    stepRegistry: registry,
    logAdapter,
    parallelExecution: options.parallelExecution,
  })
  await runner.run(suiteDefiniton)

  // no check the log status
  const res = checkTcStatus(options.extendedRes)
  return res
}

/**
 * Extract the status for each test case from the logger
 * and returns an object with the status per testcase
 */
function checkTcStatus(extended = false) {
  const runIds = Object.keys(logAdapter.logs)
  expect(runIds.length).toBe(1) // There should be one run only

  const res = {}
  const tcNames = Object.keys(logAdapter.logs[runIds[0]].testcases)
  tcNames.forEach(tcName => {
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
        stepCount: Object.keys(tcLog.steps).length,
      }
    } else {
      res[tcName] = statusLog.data.status
    }
  })

  return res
}
