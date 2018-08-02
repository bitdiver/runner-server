import { StepBase, STEP_TYPE_SINGLE } from '@bitdiver/model'

export default class StepSingleRunOnError extends StepBase {
  constructor(opts = {}) {
    super({
      ...opts,
      type: STEP_TYPE_SINGLE,
      needData: false,
      runOnError: true,
    })
  }

  async doRun() {
    return this.logger.info('Yeah, it runs')
  }
}
