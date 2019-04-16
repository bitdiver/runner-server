import ProgressMeterBatch from './ProgressMeterBatch'

export default class ProgressBarConsoleLogBatch extends ProgressMeterBatch {
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
    // eslint-disable-next-line no-console
    console.log(`| Failed:                  ${this.testcaseFailed}`)
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
  }

  /**
   * Increments the current step count. Will be called when starting
   * a new step.
   * @param name {string} The name of the current step
   */
  incStep(name) {
    super.incStep(name)

    // eslint-disable-next-line no-console
    console.log(`${this.currentStep}/${this.stepCount} ${this.lastStep}`)
  }
}
