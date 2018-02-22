
/**
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * because of a Bug in the lib 'ascii-progress' this bar is not working
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

 // import ProgressBar from 'ascii-progress'
 //
 // import ProgressMeter from './ProgressMeter'
// export default class ProgressBarConsole extends ProgressMeter {
//   constructor(opts = {}) {
//     super(opts)
//
//     this.barTestcase = undefined
//     this.barStep = undefined
//     this.barFailed = undefined
//     throw new Error('Dont use me. Its an error in ascii-progress ')
//   }
//
//   init(opts) {
//     super.init(opts)
//
//     this.barTestcase = new ProgressBar({
//       schema:
//         'Test cases: [:bar.yellow] :current/:total :percent :elapseds :etas <:name>',
//       total: this.testcaseCount,
//       clear: false,
//     })
//
//     this.barStep = new ProgressBar({
//       schema:
//         'Steps:      [:bar.green] :current/:total :percent :elapseds :etas <:name>',
//       total: this.stepCount,
//       clear: false,
//     })
//
//     this.barFailed = new ProgressBar({
//       schema: 'Failed:     [:bar.red] :current/:total :percent :elapseds :etas',
//       total: this.testcaseCount,
//       clear: false,
//     })
//
//     // print the header
//     console.log(`------------------------------------------------`) // eslint-disable-line no-console
//     console.log(`| Execute suite:           ${this.name}`) // eslint-disable-line no-console
//     console.log(`| Total step count:        ${this.stepCount}`) // eslint-disable-line no-console
//     console.log(`| Total test case count:   ${this.testcaseCount}`) // eslint-disable-line no-console
//     console.log(`------------------------------------------------`) // eslint-disable-line no-console
//
//     // make the bars Visible in the right order
//     this.barTestcase.tick()
//     this.barTestcase.tick(-1)
//
//     this.barStep.tick()
//     this.barStep.tick(-1)
//
//     this.barFailed.tick()
//     this.barFailed.tick(-1)
//   }
//
//   startOverTestcase() {
//     this.barTestcase.tick(-this.currentTestcase)
//     super.startOverTestcase()
//   }
//
//   /**
//    * increases the number of failed test cases
//    */
//   setFail() {
//     super.setFail()
//     this.barFailed.tick()
//   }
//
//   /**
//    * Increments the current testcase count. Will be called when starting
//    * a new test case in a step.
//    * @param name {string} The name of the current testcase
//    */
//   incTestcase(name) {
//     super.incTestcase(name)
//     this.barTestcase.tick({ name })
//   }
//
//   /**
//    * Increments the current step count. Will be called when starting
//    * a new step.
//    * @param name {string} The name of the current step
//    */
//   incStep(name) {
//     super.incStep(name)
//     this.barStep.tick({ name })
//   }
// }
