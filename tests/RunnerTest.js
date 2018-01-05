import { createSuite, createRegistry } from './helper/helper'
import { Runner } from '../lib/index'
import { getLogAdapter } from '../lib/index'

const logAdapter = getLogAdapter()
const TIMEOUT = 3000000

test(
  'Run normal without any errors',
  async done => {
    const registry = createRegistry()
    const suiteDefiniton = createSuite()
    // console.log('Suite:', suiteDefiniton)
    const runner = new Runner({
      stepRegistry: registry,
      logAdapter,
      parallelExecution: true,
    })

    await runner.run(suiteDefiniton)
    done()
  },
  TIMEOUT
)
