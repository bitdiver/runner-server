import { StepNormalLocal } from './StepNormalLocal'
import { getLogAdapterMemory } from '@bitdiver/logadapter'
import { EnvironmentTestcase } from '@bitdiver/model'

const logAdapter = getLogAdapterMemory()

test('Run normal without any errors', async () => {
  const step = new StepNormalLocal({ name: 'my Step Name' })
  step.logAdapter = logAdapter
  step.data = { action: 'none', value: '' }
  step.environmentTestcase = new EnvironmentTestcase({ name: 'my TC Name' })

  const methods = ['run', 'beforeRun']
  for (const method of methods) {
    await step[method as keyof StepNormalLocal]()
  }
})
