import { getLogAdapter } from '../lib/index'
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

const logger = getLogAdapter({ targetDir: logs })

const loopCount = 1000
const start = new Date()

async function gumbo() {
  heapdump.writeSnapshot(fileNameHeapDump1, (err, fileName) => {
    console.log('dump written to', fileName)
  })

  for (let i = 0; i < loopCount; i++) {
    await logger.log({
      meta: { run: { start } },
      data: {
        message: 'Das ist eine message',
        count: i,
        other: 'Any other text',
      },
    })
  }

  heapdump.writeSnapshot(fileNameHeapDump2, (err, fileName) => {
    console.log('dump written to', fileName)
  })
}

gumbo().then(() => {
  console.log('Fertig')
})
