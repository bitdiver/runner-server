import { StepBase } from '@bitdiver/model'
import { getLogAdapterFile } from '@bitdiver/logadapter'

import { createSuite, createRegistry } from './helper/helper'
import { Runner } from '../src/index'

import heapdump from 'heapdump'
import path from 'path'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'

const volatile = path.join(__dirname, 'volatile')
const logs = path.join(volatile, 'logs')

// eslint-disable-next-line no-sync
rimraf.sync(volatile)
// eslint-disable-next-line no-sync
mkdirp.sync(volatile)
// eslint-disable-next-line no-sync
mkdirp.sync(logs)

const fileNameHeapDump1 = path.join(volatile, 'heapDump1.heapsnapshot')
const fileNameHeapDump2 = path.join(volatile, 'heapDump2.heapsnapshot')

const logAdapterFile = getLogAdapterFile({ targetDir: logs })
const registry = createRegistry()

class DemoStep extends StepBase {
  /**
   * This method will be called just before the run method
   */
  run() {
    return this.logInfo('Eine Info')
    // this.logDebug('Eine Debug')
  }
}

registry.registerStep('normal', DemoStep)

async function gumbo() {
  heapdump.writeSnapshot(fileNameHeapDump1, (err, fileName) => {
    console.log('dump written to', fileName)
  })

  const options = {
    parallelExecution: true,
    posTc: 1, // The tc where to store the action
    posStep: 0, // The step where to store the action
    extendedRes: false, // should create extended log result?
    action: 'logWarning', // The action of the testcase data
    value: 'Eine Warnung', // The value for the action
  }

  const suiteDefiniton = createSuite({
    testcaseCount: 20,
    stepCount: 20,
  })

  const data = {
    run: {
      action: options.action,
      value: options.value,
    },
  }
  suiteDefiniton.testcases[options.posTc].data[options.posStep] = data

  const runner = new Runner({
    stepRegistry: registry,
    logAdapterFile,
    parallelExecution: options.parallelExecution,
  })
  await runner.run(suiteDefiniton)

  heapdump.writeSnapshot(fileNameHeapDump2, (err, fileName) => {
    console.log('dump written to', fileName)
  })
}

gumbo().then(() => {
  console.log('Fertig')
})
