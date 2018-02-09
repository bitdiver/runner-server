'use strict'

import assert from 'assert'
import path from 'path'
import mkdirp from 'mkdirp'
import jsonfile from 'jsonfile'
import { sprintf } from 'sprintf-js'

export const LEVEL_DEBUG = 'debug'
export const LEVEL_INFO = 'info'
export const LEVEL_WARNING = 'warn'
export const LEVEL_ERROR = 'error'
export const LEVEL_FATAL = 'fatal'

/**
 * Implements a default logAdapter. The results will be written to the file system
 * @class
 */
class LogAdapterFile {
  constructor(opts) {
    const param = { targetDir: 'log', ...opts }

    this.targetDir = param.targetDir
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
   *           tcCountCurrent: tcCountCurrent,
   *           tcCountAll: tcCountAll,
   *           id: 'id',
   *           name: 'great tc name'
   *         },
   *         step:{
   *           stepCountCurrent: stepCountCurrent,
   *           stepCountAll: stepCountAll,
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
    assert.ok(logMessage.meta, 'The log message does not have a meta object')
    assert.ok(logMessage.data, 'The log message does not have a meta object')

    const meta = logMessage.meta
    const data = logMessage.data
    const logLevel = logMessage.logLevel
    // const logLevel = logMessage.logLevel
    const time = logMessage.meta.time ? logMessage.meta.time : Date.now()

    const targetPath = [this.targetDir, `Run_${String(meta.run.start)}`]
    if (meta.tc !== undefined && meta.tc.name !== undefined) {
      const tcCountAllLength = String(meta.tc.countAll).length
      const tcNumberStr = sprintf(
        `%0${tcCountAllLength}d`,
        meta.tc.countCurrent
      )

      targetPath.push(`TC_${tcNumberStr}_${meta.tc.name}`)
      if (meta.step !== undefined && meta.step.name !== undefined) {
        const stringCountLength = String(meta.step.countCurrent).length
        const stepNumber = sprintf(
          `%0${stringCountLength}d`,
          meta.step.countCurrent
        )
        targetPath.push(`Step_${stepNumber}_${meta.step.name}`)
      }
    }

    const dir = path.join(...targetPath)

    return new Promise((resolve, reject) => {
      mkdirp(dir, err => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    }).then(() => {
      const fileName = Date.now() + '.json'
      targetPath.push(fileName)

      const file = path.join(...targetPath)

      return new Promise((resolve, reject) => {
        jsonfile.writeFile(
          file,
          { meta: { time }, data, logLevel },
          { spaces: 2 },
          err => {
            if (err) {
              reject(err)
            }
            resolve()
          }
        )
      })
    })
  }
}

// Stores the logger instance
let logAdapter

/**
 * returns the logAdapter
 */
export function getLogAdapter(opts) {
  if (logAdapter === undefined) {
    logAdapter = new LogAdapterFile(opts)
  }
  return logAdapter
}
