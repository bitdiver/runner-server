import ProgressMeter from './ProgressMeter'
import assert from 'assert'
import moment from 'moment'

export default class ProgressBarConsoleLogBatchJson extends ProgressMeter {
  constructor(opts = {}) {
    super(opts)
    this.sequence = 0
    this.timeZone = opts.timeZone ? opts.timeZone : moment().utcOffset()
    this.timeFormat = opts.timeFormat
      ? opts.timeFormat
      : 'YYYY-MM-DD_HH:mm:ss_ZZ'
  }

  _printHeader() {
    const data = {
      'Execute suite': `${this.name}`,
      'Total step count': `${this.stepCount}`,
      'Total test case count': `${this.testcaseCount}`,
    }

    this.log(data)
  }

  _printFooter() {
    const data = {
      'Result for suite': `${this.name}`,
      Steps: `${this.currentStep}/${this.stepCount}`,
      Testcase: `${this.currentTestcase}/${this.testcaseCount}`,
      Failed: `${this.testcaseFailed}`,
      'Last step': `${this.lastStep}`,
      'Last test case': `${this.lastTestcase}`,
    }

    this.log(data)
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
    const data = `${this.currentStep}/${this.stepCount} ${this.lastStep}`
    this.log(data)
  }

  /**
   * @param data {object} The object with the data to be logged and the needed meta data
   *     const logMessage = {
   *       meta:{
   *         run:{
   *           start: <time>,
   *           id: 'id' // RunEnvironment ID
   *           name: 'suite name'
   *         },
   *         tc:{
   *           tcCountCurrent: tcCountCurrent,
   *           tcCountAll: tcCountAll,
   *           id: 'id', // TestcaseEnvironment ID
   *           name: 'great tc name'
   *         },
   *         step:{
   *           stepCountCurrent: stepCountCurrent,
   *           stepCountAll: stepCountAll,
   *           id: 'id', // testcase instance
   *           name: 'great step name'
   *           typ: ('singel'| ''|)
   *         }
   *       }
   *       data:{},
   *       logLevel: LEVEL_INFO
   *     }
   * @return promise {promise} A promise until the log message is written
   */
  async log(message) {
    assert.ok(message, `The 'logMessage' parameter was not given`)

    const logMessage = {
      meta: {
        consoleTyp: 'ProgressBarConsole',
      },
      data: {
        message: '',
      },
    }
    logMessage.data = message

    assert.ok(
      logMessage.data,
      `The log message does not have a 'data' property`
    )

    await this._writeLog(logMessage)
  }

  /**
   * This method will do the work. It is called by the log method
   * if the logLevel of the message shows that the message is relavant for logging
   *
   */
  async _writeLog(logMessage) {
    const meta = logMessage.meta
    const data = logMessage.data

    // Set the time of the log
    if (meta.logTime === undefined) {
      meta.logTime = Date.now()
    }
    meta.logTimeString = moment(meta.logTime)
      .utcOffset(this.timeZone)
      .format(this.timeFormat)

    meta.sequence = this.sequence++

    const dataString = JSON.stringify(data)
    const dat = JSON.stringify({ meta, data: dataString })
    const outputJson = JSON.stringify(dat, null, 2)
    // eslint-disable-next-line no-console
    console.log(outputJson)
  }
}
