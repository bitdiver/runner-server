import assert from 'assert'

/**
 * This class keeps the progress when running a suite
 * It is intended to be a base class for other ProgressBars
 */
export default class ProgressMeter {
  constructor(opts = {}) {
    this.name = opts.name || 'Unknown Suite'

    // The total count of testcases
    this.testcaseCount = 0

    // the total count of steps
    this.stepCount = 0

    // the amount of failed testcases
    this.testcaseFailed = 0

    // When working on a step this is the current testcaase per step
    this.currentTestcase = 0

    // The current Step
    this.currentStep = 0

    this.lastTestcase = ''
    this.lastStep = ''
  }

  /**
   * Initializes the count of the test cases and steps
   */
  init(opts = {}) {
    assert(opts.testcaseCount, 'The test case count must be greater than 0')
    assert(opts.stepCount, 'The step count must be greater than 0')

    this.name = opts.name ? opts.name : this.name

    // The total count of testcases
    this.testcaseCount = opts.testcaseCount

    // the total count of steps
    this.stepCount = opts.stepCount
  }

  /**
   * resets all the counter
   */
  clear() {
    this.testcaseFailed = 0
    this.currentTestcase = 0
    this.currentStep = 0
    this.currentTestcaseName = ''
    this.currentStepName = ''
    this.update()
  }

  /**
   * increases the number of failed test cases
   */
  setFail() {
    this.testcaseFailed++
    this.update()
  }

  /**
   * Increments the current testcase count. Will be called when starting
   * a new test case in a step.
   * @param name {string} The name of the current testcase
   */
  incTestcase(name) {
    this.lastTestcase = name
    this.currentTestcase++
    this.currentTestcaseName = name
    this.update()
  }

  /**
   * When a step is finisched the test case counting starts again
   */
  startOverTestcase() {
    this.currentTestcase = 0
    this.currentTestcaseName = ''
    this.update()
  }

  /**
   * Increments the current step count. Will be called when starting
   * a new step.
   * @param name {string} The name of the current step
   */
  incStep(name) {
    this.lastStep = name
    this.currentStep++
    this.currentStepName = name
    this.update()
  }

  /**
   * Called when the test is over
   */
  done() {}

  /**
   * Updates the Output
   */
  update() {}
}
