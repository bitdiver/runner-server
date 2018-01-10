'use strict'

import assert from 'assert'
import path from 'path'
import mkdirp from 'mkdirp'
import jsonfile from 'jsonfile'

export const LEVEL_DEBUG = 'debug'
export const LEVEL_INFO = 'info'
export const LEVEL_WARNING = 'warn'
export const LEVEL_ERROR = 'error'
export const LEVEL_FATAL = 'fatal'

/**
 * This logadapter stores all the logs into memory.
 * The format of the stored logs is as follows:
 * const this.logs = {
 *   runId: {
 *     logs:[{}, ...]
 *     testcases:{tcId: testcase}
 *   }
 * }
 *
 * const testcase = {
 *   steps: {}
 *   logs: []
 * }
 *
 * const step = {
 *   logs: []
 * }
 *
 */
class LogAdapterMemory {
  constructor() {
    this.logs = {}
  }

  clear() {
    this.logs = {}
  }

  /**
   * @param data {object} The object with the data to be logged and the needed meta data
   *     const logMessage = {
   *       meta:{
   *         run:{
   *           start: <time>,
   *           id: 'id'
   *         },
   *         tc:{
   *           id: 'id',
   *           name: 'great tc name'
   *         },
   *         step:{
   *           id: 'id',
   *           name: 'great step name'
   *           typ: ('singel'| ''|)
   *         }
   *       }
   *       data:{},
   *       logLevel: LEVEL_INFO
   *     }
   * @return promise {promise} A promise for writing the file
   */
  log(logMessage) {
    // if (logMessage.data === undefined) {
    //   console.log('+++++++++++++++++++++++++++++')
    //   console.log(logMessage)
    // }

    assert.ok(logMessage.meta, `The log message does not have a 'meta' object`)
    assert.ok(logMessage.data, `The log message does not have a 'data' object`)

    const meta = logMessage.meta
    const data = logMessage.data
    const logLevel = logMessage.logLevel

    data.logLevel = logLevel

    if (meta.step !== undefined && meta.step.id !== undefined) {
      // this is a step log
      this.logStep(meta.run.id, meta.tc.name, meta.step.name, data)
    } else if (meta.tc !== undefined && meta.tc.id !== undefined) {
      // This is a testcase log
      this.logTestcase(meta.run.id, meta.tc.name, data)
    } else {
      // This is a run log
      this.logRun(meta.run.id, data)
    }

    return Promise.resolve()
  }

  logRun(runId, data) {
    if (this.logs[runId] === undefined) {
      this.logs[runId] = {
        logs: [],
        testcases: {},
      }
    }
    this.logs[runId].logs.push(data)
  }

  logTestcase(runId, testcaseName, data) {
    if (this.logs[runId].testcases[testcaseName] === undefined) {
      this.logs[runId].testcases[testcaseName] = {
        logs: [],
        steps: {},
      }
    }
    this.logs[runId].testcases[testcaseName].logs.push(data)
  }

  logStep(runId, testcaseName, stepName, data) {
    if (this.logs[runId].testcases[testcaseName] === undefined) {
      this.logs[runId].testcases[testcaseName] = {
        logs: [],
        steps: {},
      }
    }
    if (
      this.logs[runId].testcases[testcaseName].steps[stepName] === undefined
    ) {
      this.logs[runId].testcases[testcaseName].steps[stepName] = {
        logs: [],
      }
    }
    this.logs[runId].testcases[testcaseName].steps[stepName].logs.push(data)
  }

  async writeFile(fileName) {
    const dir = path.dirname(fileName)

    return new Promise((resolve, reject) => {
      mkdirp(dir, err => {
        if (err) {
          reject(err)
        }
      })
      resolve()
    }).then(() => {
      return new Promise((resolve, reject) => {
        jsonfile.writeFile(fileName, this.logs, { spaces: 2 }, err => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      })
    })

    // // eslint-disable-next-line no-sync
    // mkdirp.sync(dir)
    // // eslint-disable-next-line no-sync
    // jsonfile.writeFileSync(fileName, this.logs, { spaces: 2 })
    //
    // return Promise.resolve()
  }
}

// Stores the logger instance
let logAdapter

/**
 * returns the logAdapter
 */
export function getLogAdapter(opts) {
  if (logAdapter === undefined) {
    logAdapter = new LogAdapterMemory(opts)
  }
  return logAdapter
}
