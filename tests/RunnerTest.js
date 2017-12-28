import { createSuite, createRegistry } from './helper/helper'
import { Runner } from '../lib/index'

test('Run normal without any errors', () => {
  debugger
  const registry = createRegistry()
  const suiteDefiniton = createSuite()
  const runner = new Runner({ stepRegistry: registry })
  runner.run(suiteDefiniton)
})
