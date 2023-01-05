/**
 * This class keeps the progress when running a suite
 * It is intended to be a base class for other ProgressBars
 * If currentStep=0 or currentTestcase=0 This means that
 * no step or test case is currently executing. This should
 * not be used to update a display. First the step is increased. Then the
 * testcase is set to '0', then the testcase is set again. But all of these actions
 * trigger an update.
 *
 */
export class ProgressMeterNormal {
  /** The namne for this progress bar */
  name: string

  /** The total count of testcases */
  testcaseCount: number = 0

  /** the total count of steps */
  stepCount: number = 0

  /** the amount of failed testcases */
  testcaseFailed: number = 0

  /** When working on a step this is the current testcaase per step */
  currentTestcase: number = 0

  /** The count of steps in the current test case */
  testcaseStepCount: number = 0

  /** The current Step index */
  currentStep: number = 0

  /** The name of the last Testcase */
  lastTestcaseName: string = ''

  /** The name of the last step */
  lastStepName: string = ''

  /** The name of the current Testcase */
  currentTestcaseName: string = ''

  /** The name of the current step */
  currentStepName: string = ''

  constructor(name?: string) {
    this.name = name ?? 'Unknown Suite'
  }

  /**
   * Initializes the count of the test cases and steps
   */
  init(request: {
    testcaseCount: number
    stepCount: number
    name?: string
  }): void {
    const { testcaseCount, stepCount, name } = request

    if (name !== undefined) {
      this.name = name
    }

    // The total count of testcases
    this.testcaseCount = testcaseCount

    // the total count of steps
    this.stepCount = stepCount
  }

  /**
   * resets all the counter
   */
  clear(): void {
    this.name = ''
    this.testcaseCount = 0
    this.stepCount = 0
    this.testcaseFailed = 0
    this.currentTestcase = 0
    this.testcaseStepCount = 0
    this.currentStep = 0
    this.lastTestcaseName = ''
    this.lastStepName = ''
    this.currentTestcaseName = ''
    this.currentStepName = ''
    this.update()
  }

  /**
   * increases the number of failed test cases
   */
  setFail(): void {
    this.testcaseFailed++
    this.update()
  }

  /**
   * Increments the current testcase count. Will be called when starting
   * a new test case in a step.
   * @param name - The name of the current testcase
   */
  incTestcase(name: string, stepCount: number): void {
    this.currentTestcase++
    this.lastTestcaseName = name
    this.currentTestcaseName = name
    this.testcaseStepCount = stepCount

    this.update()
  }

  /**
   * Increments the current step count. Will be called when starting
   * a new step.
   * @param name - The name of the current step
   */
  incStep(name: string): void {
    this.lastStepName = name
    this.currentStep++
    this.currentStepName = name
    this.update()
  }

  /**
   * Called when the test is over
   */
  done(): void {}

  /**
   * Updates the Output
   */
  update(): void {}
}
