import ProgressMeter from './ProgressMeter'
import chalk from 'chalk'

const TEXT_LABEL = chalk.bold.black
const TEXT_CONTENT = chalk.bold.green
const PROGRESS_BAR_CHARCTER = '#'
const PROGRESS_BAR_CHARCTER_EMPTY = ' '
const PROGRESS_BAR_CHARCTER_COLOR = chalk.bold.green.bgGreen

export default class ProgressBarConsole extends ProgressMeter {
  constructor(opts = {}) {
    super(opts)

    // The length of the progress bar
    this.barLength = opts.barLength ? opts.barLength : 30

    this.lastBarLengthTable = 0
    this.lastBarLengthTestcase = 0

    this.rows = { '1': 0, '2': 0, '3': 0 }
  }

  /**
   * Returns a string in the given length of the given character
   * @param str {string} The string to be repeated
   * @param count {string} The repeating count
   * @param res {string} The string to be printed
   */
  repeat(str, count) {
    return Array(count + 1).join(str)
  }

  /**
   * Creates the string to be printed as the progress bar
   * @param count {number} The current count
   * @param total {number} The total amount
   * @param barLength {number} The length of the bar in characters
   * @return bar {string} The bar to be printet
   */
  createBar(count = 0, total = 100, barLength) {
    let ticks = 0
    if (count > 0 && total > 0) {
      const percent = (count / total) * 100
      ticks = Math.floor((percent / 100) * barLength)
    }

    const bar = this.repeat(PROGRESS_BAR_CHARCTER, ticks)
    const empty = this.repeat(PROGRESS_BAR_CHARCTER_EMPTY, barLength - ticks)
    return '[' + PROGRESS_BAR_CHARCTER_COLOR(bar) + empty + ']'
  }

  /**
   * Prints the progress bar
   * @param label {string} The label for the bar
   * @param countCurrent {number} The number of the totals
   * @param countTotal {number} The current progress
   * @param row {number} The row of the progress bar
   */
  printProgressBar(label, countCurrent, countTotal, row) {
    const bar = this.createBar(countCurrent, countTotal, this.barLength)

    let barExtension
    if (row === 1) {
      // barExtension = `(${TEXT_CONTENT(this.currentStepName)})`
      barExtension = `(${TEXT_CONTENT(countCurrent)}${TEXT_LABEL(
        '/'
      )}${TEXT_CONTENT(countTotal)}  ${TEXT_CONTENT(this.currentStepName)})`
    } else if (row === 2) {
      barExtension = `(${TEXT_CONTENT(countCurrent)}${TEXT_LABEL(
        '/'
      )}${TEXT_CONTENT(countTotal)}  ${TEXT_CONTENT(this.currentTestcaseName)})`
    } else {
      barExtension = `(${TEXT_CONTENT(countCurrent)}${TEXT_LABEL(
        '/'
      )}${TEXT_CONTENT(countTotal)})`
    }

    process.stdout.write(
      `${TEXT_LABEL(label)} ${bar}  ${barExtension}${this.getSpaces(
        row,
        barExtension.length
      )}\n`
    )
  }

  /**
   * Create spaces to overwrite text which where printed before.
   * @param row {number} The row of the progress bar
   * @param barLength {number} The length of the current text
   * @return spaces {string} A string of spaces
   */
  getSpaces(row, barLength) {
    if (this.rows[row] < barLength) {
      this.rows[row] = barLength
    }

    const diffText = this.repeat(' ', this.rows[row] - barLength)
    return diffText
  }

  _printHeader() {
    process.stdout.write(`\n`)
    process.stdout.write(`\n`)
    process.stdout.write(`------------------------------------------------\n`) // eslint-disable-line no-console
    process.stdout.write(`| Execute suite:           ${this.name}\n`) // eslint-disable-line no-console
    process.stdout.write(`| Total step count:        ${this.stepCount}\n`) // eslint-disable-line no-console
    process.stdout.write(`| Total test case count:   ${this.testcaseCount}\n`) // eslint-disable-line no-console
    process.stdout.write(`------------------------------------------------\n`) // eslint-disable-line no-console
  }

  _printFooter() {
    process.stdout.write(`------------------------------------------------\n`) // eslint-disable-line no-console
    process.stdout.write(`| Result for suite:        ${this.name}\n`) // eslint-disable-line no-console
    // eslint-disable-next-line no-console
    process.stdout.write(
      `| Steps:                   ${this.currentStep}/${this.stepCount}\n`
    )
    // eslint-disable-next-line no-console
    process.stdout.write(
      `| Testcase:                ${this.currentTestcase}/${
        this.testcaseCount
      }\n`
    )
    process.stdout.write(`| Last step:               ${this.lastStep}\n`) // eslint-disable-line no-console
    process.stdout.write(`| Last test case:          ${this.lastTestcase}\n`) // eslint-disable-line no-console
    process.stdout.write(`------------------------------------------------\n`) // eslint-disable-line no-console
    process.stdout.write(`\n`)
    process.stdout.write(`\n`)
  }

  done() {
    if (process.stdout.isTTY) {
      process.stdout.moveCursor(0, +3)
    }
    super.done()
    this._printFooter()
  }

  init(opts) {
    super.init(opts)

    this._printHeader()
  }

  /**
   * Updates the Output
   */
  update() {
    this.printProgressBar('Steps      :', this.currentStep, this.stepCount, 1)
    this.printProgressBar(
      'Test cases :',
      this.currentTestcase,
      this.testcaseCount,
      2
    )
    this.printProgressBar(
      'Failed     :',
      this.testcaseFailed,
      this.testcaseCount,
      3
    )
    // this.printTableBar()
    // this.printTestcaseBar()
    if (process.stdout.isTTY) {
      process.stdout.moveCursor(0, -3)
    }
  }
}
