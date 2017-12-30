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
 * Implements a default logAdapter
 * @class
 */
class LogAdapterFile {
  constructor(opts) {
    const param = { targetDir: 'log', ...opts }

    this.targetDir = param.targetDir
  }

  /**
   * @param data {object} The object with the data to be logged and the needed meta data
   *   const data = {
   *     meta:{
   *       timeRunStart: ''
   *       idRun: ''
   *       idTestcase: ''
   *       idStep: ''
   *     }
   *     data:{}
   *   }
   * @return promise {promise} A promise for writing the file
   */
  log(logMessage) {
    assert.ok(logMessage.meta, 'The log message does not have a meta object')
    assert.ok(logMessage.data, 'The log message does not have a meta object')

    const meta = logMessage.meta
    const data = logMessage.data

    const targetPath = [this.targetDir, `Run_${String(meta.timeRunStart)}`]
    if (meta.idTestcase !== undefined) {
      targetPath.push(`TC_${meta.idTestcase}`)
      if (meta.idStep !== undefined) {
        targetPath.push(`Step_${data.step}`)
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
        jsonfile.writeFile(file, data, { spaces: 2 }, err => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      })
    })
  }
}

// Stores the logger instance
let logAdapter

export function getLogAdapter(opts) {
  if (logAdapter === undefined) {
    logAdapter = new LogAdapterFile(opts)
  }
  return logAdapter
}
