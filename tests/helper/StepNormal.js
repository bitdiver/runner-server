import { StepBase } from '@bitdiver/model'

/**
 * Simulates a normal step. Dependend on the given step data the step
 * will cretae errors or will fail in one of the given methods
 */
export default class StepNormal extends StepBase {
  /**
   * This method will be called when the step starts.
   */
  start() {
    return this._work('start')
  }

  /**
   * This method will be called just before the run method
   */
  beforeRun() {
    return this._work('beforeRun')
  }

  /**
   * This method will be called just before the run method
   */
  run() {
    return this._work('run')
  }

  /**
   * This method will be called just after the run is finished
   */
  afterRun() {
    return this._work('afterRun')
  }

  /**
   * This method will be called when the step is finished
   */
  end() {
    return this._work('end')
  }

  _work(method) {
    if (this.data[method] !== undefined) {
      // Ok there is an action defined for this method
      const action = this.data[method].action
      const value = this.data[method].value

      if (action === 'logInfo') {
        this.logInfo(value)
      } else if (action === 'logWarning') {
        this.logWarning(value)
      } else if (action === 'logError') {
        this.logError(value)
      } else if (action === 'logFatal') {
        this.logFatal(value)
      } else if (action === 'exception') {
        throw new Error(value)
      }
    }
    return Promise.resolve()
  }
}
