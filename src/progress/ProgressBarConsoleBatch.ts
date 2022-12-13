import ProgressBar from 'ts-progress'

import { ProgressMeterBatch } from './ProgressMeterBatch'

export class ProgressBarConsoleBatch extends ProgressMeterBatch {
  progressBar?: any

  _printHeader(): void {
    console.log('------------------------------------------------') // eslint-disable-line no-console
    console.log(`| Execute suite:           ${this.name}`) // eslint-disable-line no-console
    console.log(`| Total step count:        ${this.stepCount}`) // eslint-disable-line no-console
    console.log(`| Total test case count:   ${this.testcaseCount}`) // eslint-disable-line no-console
    console.log('------------------------------------------------') // eslint-disable-line no-console
  }

  _printFooter(): void {
    console.log('------------------------------------------------') // eslint-disable-line no-console
    console.log(`| Result for suite:        ${this.name}`) // eslint-disable-line no-console
    // eslint-disable-next-line no-console
    console.log(
      `| Steps:                   ${this.currentStep}/${this.stepCount}`
    )
    // eslint-disable-next-line no-console
    console.log(
      `| Testcase:                ${this.currentTestcase}/${this.testcaseCount}`
    )
    console.log(`| Last step:               ${this.lastStepName}`) // eslint-disable-line no-console
    console.log(`| Last test case:          ${this.lastTestcaseName}`) // eslint-disable-line no-console
    console.log('------------------------------------------------') // eslint-disable-line no-console
  }

  done(): void {
    super.done()
    this._printFooter()
  }

  init(request: {
    testcaseCount: number
    stepCount: number
    name?: string
  }): void {
    super.init(request)

    this._printHeader()

    this.progressBar = ProgressBar.create({
      total: this.stepCount,
      pattern:
        'Step progress:  {bar} | {current}/{total} | Remaining: {remaining} | Elapsed: {elapsed} | Memory: {memory} ',
      textColor: 'green',
      updateFrequency: 100
    })
  }

  /**
   * Increments the current step count. Will be called when starting
   * a new step.
   * @param name - The name of the current step
   */
  incStep(name: string): void {
    super.incStep(name)
    this.progressBar.update()
  }
}
