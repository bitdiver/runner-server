import StepNormal from './StepNormal'
import { STEP_TYPE_SINGLE } from '@bitdiver/model'

/**
 * Simulates a single step. Dependend on the given step data the step
 * will cretae errors or will fail in one of the given methods
 */
export default class StepSingle extends StepNormal {
  constructor(opts = {}) {
    super(opts)
    this.type = STEP_TYPE_SINGLE
  }
  _work(method) {
    this.data.forEach(dat => {
      if (dat[method] !== undefined) {
        // Ok there is an action defined for this method
        const action = dat[method].action
        const value = dat[method].value

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
    })
    return new Promise(resolve => {
      const min = 10
      const max = 500
      const time = Math.floor(Math.random() * (max - min)) + min
      setTimeout(() => {
        // console.log(
        //   `Execute Single Step '${this.name}' with method '${method}''`
        // )
        resolve(1)
      }, time)
    })
  }
}
