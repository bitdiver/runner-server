'use strict'

import fs from 'fs'
import assert from 'assert'
import moment from 'moment'
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
  async log(logMessage) {
    assert.ok(logMessage.meta, 'The log message does not have a meta object')
    assert.ok(logMessage.data, 'The log message does not have a data object')

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

    return new Promise(async (resolve, reject) => {
      mkdirp(dir, async err => {
        if (err) {
          reject(err)
        } else {
          const timeStamp = moment(Date.now()).format('YYYY-MM-DD_HH:mm:ss.SSS')
          // const fileName = `${timeStamp}_${logLevel}.json`
          // targetPath.push(fileName)
          //
          // const file = path.join(...targetPath)

          const file = await this.getFileName(targetPath, timeStamp, logLevel)

          jsonfile.writeFile(
            file,
            { meta: { time }, data, logLevel },
            { spaces: 2 },
            err1 => {
              if (err1) {
                reject(err1)
              }
              resolve()
            }
          )
        }
      })
    })
  }

  /**
   * Creates a filename which does not yet exists
   * @param targetPath {array} An array of path segements
   * @param timeStamp {string} The current time stamp
   * @param logLevel {string} The loglevel of this message
   * @return fileName {string} A new created not existing file name
   */
  async getFileName(targetPath, timeStamp, logLevel) {
    let fileName
    let fileIsOk
    let seq = 0
    do {
      if (seq === 0) {
        fileName = path.join(...targetPath, `${timeStamp}_${logLevel}.json`)
      } else {
        fileName = path.join(
          ...targetPath,
          `${timeStamp}_${seq}_${logLevel}.json`
        )
      }

      fileIsOk = await new Promise(resolve => {
        fs.access(fileName, fs.constants.F_OK, err => {
          if (err) {
            resolve(true) // err means that the file does not exists
          } else {
            resolve(false)
          }
        })
      })
      seq++
    } while (!fileIsOk)

    return fileName
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
