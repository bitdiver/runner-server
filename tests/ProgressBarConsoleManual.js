import { createSuite, createRegistry } from './helper/helper'
import { Runner, ProgressBarConsole } from '../lib/index'
import { getLogAdapterMemory } from '@bitdiver/logadapter'

const logAdapter = getLogAdapterMemory()
const registry = createRegistry()

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
  logAdapter,
  parallelExecution: options.parallelExecution,
  progressMeterNormal: new ProgressBarConsole(),
})

runner
  .run(suiteDefiniton)
  .then(() => {
    console.log('\n\nFINISHED') // eslint-disable-line no-console
  })
  .catch(err => {
    console.log('ERROR: ', err) // eslint-disable-line no-console
  })
