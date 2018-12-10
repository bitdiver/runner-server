import { createRegistry } from './helper/helper'
import { Runner } from '../lib/index'
import { getLogAdapterMemory } from '@bitdiver/logadapter'

import StepTestQueue from './helper/StepTestQueue'

const logAdapter = getLogAdapterMemory()
const TIMEOUT = 1000000
const registry = createRegistry()

const runner = new Runner({
  stepRegistry: registry,
  logAdapter,
  parallelExecution: true,
})

test(
  'Test that the steps are executed at the same time',
  async done => {
    const methods = ['beforeRun', 'run', 'afterRun']
    const stepInstances = createSteps(5)

    const startTime = new Date()
    runner._executeStepMethodParallel(stepInstances, methods).then(() => {
      const endTime = new Date()

      expect(endTime - startTime).toBeLessThan(6 * 1000)
      expect(endTime - startTime).toBeGreaterThan(4 * 1000)

      done()
    })
  },
  TIMEOUT
)

function createSteps(count) {
  const steps = []
  for (let i = 0; i < count; i++) {
    const step = new StepTestQueue({ name: 'Step Name', tcName: `TC_${i + 1}` })
    steps.push(step)
  }
  return steps
}
