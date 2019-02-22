import { StepBase } from '@bitdiver/model'

/**
 * Simulates a normal step. Dependend on the given step data the step
 * will create errors or will fail in one of the given methods.
 * const data = {
 *   // The method name
 *   start:{
 *     // the action to perform
 *     action: 'logInfo',
 *     // the message to be logged
 *     value: 'Some message to log'
 *   },
 *   run:{
 *     // Throws an exception in the run method
 *     action: 'exception'
 *     value: 'Arrgh very bad exception'
 *   }
 * }
 */
export default class StepNormal extends StepBase {
  /**
   * This method will be called when the step starts.
   */
  async start() {
    await this._work('start')
  }

  /**
   * This method will be called just before the run method
   */
  async beforeRun() {
    await this._work('beforeRun')
  }

  /**
   * This method will be called just before the run method
   */
  async run() {
    await this._work('run')
  }

  /**
   * This method will be called just after the run is finished
   */
  async afterRun() {
    await this._work('afterRun')
  }

  /**
   * This method will be called when the step is finished
   */
  async end() {
    await this._work('end')
  }

  async _work(method) {
    let min = 5
    let max = 100
    let action = 'No Action' // This leads to NO log entry
    let value = 'No Value'

    if (this.data[method] !== undefined) {
      // Ok there is an action defined for this method
      if (this.data[method].action !== undefined) {
        action = this.data[method].action
      }
      if (this.data[method].value !== undefined) {
        value = this.data[method].value
      }

      if (this.data[method].min !== undefined) {
        min = this.data[method].min
      }
      if (this.data[method].max !== undefined) {
        max = this.data[method].max
      }
    }

    if (action === 'exception') {
      throw new Error(value)
    }

    return new Promise(resolve => {
      const time = Math.floor(Math.random() * (max - min)) + min
      setTimeout(() => {
        if (action === 'logInfo') {
          resolve(this.logInfo(value))
        } else if (action === 'logWarning') {
          resolve(this.logWarning(value))
        } else if (action === 'logError') {
          resolve(this.logError(value))
        } else if (action === 'logFatal') {
          resolve(this.logFatal(value))
        }

        resolve(1)
      }, time)
    })
  }
}
