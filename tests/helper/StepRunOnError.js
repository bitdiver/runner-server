import { StepBase } from '@bitdiver/model'

export default class StepRunOnError extends StepBase {
  constructor(opts = {}) {
    super({ ...opts, needData: false, runOnError: true })
  }

  async doRun() {
    return this.logger.info('Yeah, it runs')
  }
}
