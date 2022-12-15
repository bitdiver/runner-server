import { StepBase, StepType } from '@bitdiver/model'
import { StepOptions } from '@bitdiver/model/dist/src/interfaceStepOptions'

export class StepSingleRunOnError extends StepBase {
  constructor(opts: StepOptions) {
    super({
      ...opts,
      type: StepType.single,
      needData: false,
      runOnError: true
    })
  }

  async doRun(): Promise<void> {
    return await this.logInfo('Yeah, it runs')
  }
}
