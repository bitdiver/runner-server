import { ProgressMeterBatch } from './ProgressMeterBatch'
import { DateTime } from 'luxon'

export class ProgressBarConsoleLogBatchJson extends ProgressMeterBatch {
  sequence: number

  /** The luxon time format */
  timeFormat: string

  constructor(opts: { name: string; timeFormat?: string }) {
    super(opts.name)
    this.sequence = 0
    this.timeFormat = opts.timeFormat
      ? opts.timeFormat
      : 'yyyy-MM-dd_HH:mm:ss_ZZ'
  }

  _printHeader(): void {
    const data = {
      'Execute suite': `${this.name}`,
      'Total step count': `${this.stepCount}`,
      'Total test case count': `${this.testcaseCount}`
    }

    this.log(data)
  }

  _printFooter(): void {
    const data = {
      'Result for suite': `${this.name}`,
      Steps: `${this.currentStep}/${this.stepCount}`,
      Testcase: `${this.currentTestcase}/${this.testcaseCount}`,
      Failed: `${this.testcaseFailed}`,
      'Last step': `${this.lastStepName}`,
      'Last test case': `${this.lastTestcaseName}`
    }

    this.log(data)
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
  }

  /**
   * Increments the current step count. Will be called when starting
   * a new step.
   * @param name - The name of the current step
   */
  incStep(name: string): void {
    super.incStep(name)

    // eslint-disable-next-line no-console
    const data = `${this.currentStep}/${this.stepCount} ${this.lastStepName}`
    this.log(data)
  }

  /**
   * @param data -  The object with the data to be logged and the needed meta data
   *     const logMessage = \{
   *       meta:\{
   *         logTyp: 'ProgressBarConsole',
   *         logTime: 1555574996384,
   *         logTimeString: '2019-04-18_10:09:56_+0200',
   *         sequence: '0',
   *       \}
   *       data:\{
   *          message: ''
   *       \},
   *     \}
   */
  log(message: any): void {
    const logMessage = {
      meta: {
        logTyp: 'ProgressBarConsole'
      },
      data: {
        message: ''
      }
    }
    logMessage.data = message

    this._writeLog(logMessage)
  }

  /**
   * This method will do the work. It is called by the log method
   * if the logLevel of the message shows that the message is relavant for logging
   * @param logMessage - The message to be logged
   */
  _writeLog(logMessage: any): void {
    const meta = logMessage.meta
    const data = logMessage.data

    // Set the time of the log
    if (meta.logTime === undefined) {
      meta.logTime = Date.now()
    }

    meta.logTimeString = DateTime.fromMillis(meta.logTime).toFormat(
      this.timeFormat
    )

    meta.sequence = this.sequence++

    const outputJson = JSON.stringify({ meta, data })
    // eslint-disable-next-line no-console
    console.log(outputJson)
  }
}
