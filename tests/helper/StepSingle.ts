import { StepSingle, StepType } from '@bitdiver/model'
import { StepOptions } from '@bitdiver/model/dist/src/interfaceStepOptions'

/**
 * Simulates a single step. Dependend on the given step data the step
 * will cretae errors or will fail in one of the given methods
 */
export class StepSingleLocal extends StepSingle {
  constructor(opts: StepOptions) {
    super(opts)
    this.type = StepType.single
  }

  async _work(method: string): Promise<void> {
    if (this.data === undefined) {
      throw new Error('No Data defined')
    }
    for (const dat of this.data) {
      if (dat[method] !== undefined) {
        // Ok there is an action defined for this method
        const action = dat[method].action
        const value = dat[method].value

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
    }
    return await new Promise((resolve) => {
      const min = 5
      const max = 100
      const time = Math.floor(Math.random() * (max - min)) + min
      setTimeout(() => {
        // console.log(
        //   `Execute Single Step '${this.name}' with method '${method}''`
        // )
        resolve()
      }, time)
    })
  }
}
