import { StepBase } from '@bitdiver/model'
import { StepOptions } from '@bitdiver/model/dist/src/interfaceStepOptions'

export class StepRunOnError extends StepBase {
  constructor(opts: StepOptions) {
    super({ ...opts, needData: false, runOnError: true })
  }

  async doRun(): Promise<void> {
    return await this.logInfo('Yeah, it runs')
  }
}
