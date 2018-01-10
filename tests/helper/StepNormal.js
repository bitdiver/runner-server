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
    // const tcName1 = this.environmentTestcase.name
    // console.log(
    //   `Execute Step '${this.name}' with method '${method}' in TC '${tcName1}'`
    // )
    if (this.data[method] !== undefined) {
      // Ok there is an action defined for this method
      const action = this.data[method].action
      const value = this.data[method].value

      if (action === 'logInfo') {
        await this.logInfo(value)
      } else if (action === 'logWarning') {
        await this.logWarning(value)
      } else if (action === 'logError') {
        await this.logError(value)
      } else if (action === 'logFatal') {
        await this.logFatal(value)
      } else if (action === 'exception') {
        throw new Error(value)
      }
    }
    return new Promise(resolve => {
      const min = 5
      const max = 100
      const time = Math.floor(Math.random() * (max - min)) + min
      setTimeout(() => {
        // const tcName = this.environmentTestcase.name
        // console.log(
        //   `Execute Step '${
        //     this.name
        //   }' with method '${method}' in TC '${tcName}'`
        // )
        resolve(1)
      }, time)
    })
  }
}
