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

  /**
   * This method will be called when the step starts.
   */
  async start(): Promise<void> {
    await this._work('start')
  }

  /**
   * This method will be called just before the run method
   */
  async beforeRun(): Promise<void> {
    await this._work('beforeRun')
  }

  /**
   * This method will be called just before the run method
   */
  async run(): Promise<void> {
    await this._work('run')
  }

  /**
   * This method will be called just after the run is finished
   */
  async afterRun(): Promise<void> {
    await this._work('afterRun')
  }

  /**
   * This method will be called when the step is finished
   */
  async end(): Promise<void> {
    await this._work('end')
  }

  async _work(method: string): Promise<void> {
    const min = 5
    const max = 100
    const time = Math.floor(Math.random() * (max - min)) + min

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

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('')
      }, time)
    })
  }
}
