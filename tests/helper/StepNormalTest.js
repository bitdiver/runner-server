import StepNormal from './StepNormal'
import { getLogAdapterMemory } from '@bitdiver/logadapter'

const logAdapter = getLogAdapterMemory()

test.skip('Run normal without any errors', async (done) => {
  const step = new StepNormal()
  step.logger = logAdapter
  step.data = { action: 'none', value: '' }
  step.name = 'my Step Name'
  step.environmentTestcase = { name: 'my TC Name' }

  const methods = ['run', 'beforeRun']
  methods.forEach(async (method) => {
    await step[method]()
  })

  done()
})
