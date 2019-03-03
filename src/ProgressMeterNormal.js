import assert from 'assert'

/**
 * This progress meter is for normal execution. One test case after an other.
 * For batch execution an other ProgressMeter is neeed
 *
 */
export default class ProgressMeterNormal {
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

    // the count of steps in the current test case
    this.testcaseStepCount = 0

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
    this.testcaseCount = 0
    this.stepCount = 0
    this.testcaseFailed = 0
    this.currentTestcase = 0
    this.currentStep = 0
    this.testcaseStepCount = 0
    this.lastTestcase = ''
    this.lastStep = ''
    this.update()
  }

  /**
   * increases the number of failed test cases.
   * Must only be called once per test case
   */
  setFail() {
    this.testcaseFailed++
    this.update()
  }

  /**
   * Increments the current testcase count. Will be called when starting
   * a new test case in a step.
   * @param name {string} The name of the current testcase
   * @param stepCount {number} The number of steps in this test case
   */
  incTestcase(name, stepCount) {
    assert.ok(name, `no 'name' property given`)
    assert.ok(stepCount, `no 'stepCount' property given`)
    this.lastTestcase = name
    this.currentTestcase++
    this.currentTestcaseName = name
    this.testcaseStepCount = stepCount
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
