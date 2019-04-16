import ProgressBar from 'ts-progress'

import ProgressMeterBatch from './ProgressMeterBatch'

export default class ProgressBarConsoleBatch extends ProgressMeterBatch {
  constructor(opts = {}) {
    super(opts)
    this.barStep = undefined
  }

  _printHeader() {
    console.log(`------------------------------------------------`) // eslint-disable-line no-console
    console.log(`| Execute suite:           ${this.name}`) // eslint-disable-line no-console
    console.log(`| Total step count:        ${this.stepCount}`) // eslint-disable-line no-console
    console.log(`| Total test case count:   ${this.testcaseCount}`) // eslint-disable-line no-console
    console.log(`------------------------------------------------`) // eslint-disable-line no-console
  }

  _printFooter() {
    console.log(`------------------------------------------------`) // eslint-disable-line no-console
    console.log(`| Result for suite:        ${this.name}`) // eslint-disable-line no-console
    // eslint-disable-next-line no-console
    console.log(
      `| Steps:                   ${this.currentStep}/${this.stepCount}`
    )
    // eslint-disable-next-line no-console
    console.log(
      `| Testcase:                ${this.currentTestcase}/${this.testcaseCount}`
    )
    console.log(`| Last step:               ${this.lastStep}`) // eslint-disable-line no-console
    console.log(`| Last test case:          ${this.lastTestcase}`) // eslint-disable-line no-console
    console.log(`------------------------------------------------`) // eslint-disable-line no-console
  }

  done() {
    super.done()
    this._printFooter()
  }

  init(opts) {
    super.init(opts)

    this._printHeader()

    this.barStep = ProgressBar.create({
      total: this.stepCount,
      pattern:
        'Step progress:  {bar} | {current}/{total} | Remaining: {remaining} | Elapsed: {elapsed} | Memory: {memory} ',
      textColor: 'green',
      updateFrequency: 100,
    })
  }

  /**
   * Increments the current step count. Will be called when starting
   * a new step.
   * @param name {string} The name of the current step
   */
  incStep(name) {
    super.incStep(name)
    this.barStep.update()
  }
}
