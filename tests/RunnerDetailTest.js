import { Runner } from '../lib/index'
import { getLogAdapter } from '../lib/index'
import { createSuite, createRegistry } from './helper/helper'
import StepNormal from './helper/StepNormal'

const logAdapter = getLogAdapter()

const TC_COUNT = 3
const STEP_COUNT = 2
const TIMEOUT = 30000

test.skip(
  'Run normal without any errors',
  async done => {
    const suite = createSuite({
      testcaseCount: TC_COUNT,
      stepCount: STEP_COUNT,
    })
    const registry = createRegistry()
    const runner = new Runner({ stepRegistry: registry, logAdapter })

    runner._prepare(suite)
    runner._createEnvironments(suite)

    function getTestcaseEnvironment(num) {
      const id = runner.environmentTestcaseIds[num]
      return runner.environmentTestcase.get(id)
    }

    for (let i = 0; i < STEP_COUNT; i++) {
      const stepInstances = []
      for (let j = 0; j < TC_COUNT; j++) {
        const step = new StepNormal()
        step.logger = logAdapter
        step.data = { action: 'logInfo', value: `Val ${i}` }
        step.name = `my Step ${i}`
        step.environmentTestcase = getTestcaseEnvironment(j)
        stepInstances.push(step)
      }
      await runner._executeStepMethod(stepInstances, ['beforeRun', 'run'])
    }

    done()
  },
  TIMEOUT
)
