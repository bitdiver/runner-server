export default class StepTestQueue {
  constructor(opts = {}) {
    this.name = opts.name
    this.tcName = opts.tcName
    this.console = opts.console || false
  }

  async logInfo(msg) {
    this.logMe(
      `Step: ${this.name} -> TC: ${
        this.tcName
      } at ${new Date()} method: 'logInfo' \t ${msg}`
    )
  }

  /**
   * This method will be called when the step starts.
   */
  async start() {
    this.logMe(
      `Step: ${this.name} -> TC: ${
        this.tcName
      } at ${new Date()} method: 'start'`
    )
  }

  /**
   * This method will be called just before the run method
   */
  async beforeRun() {
    this.logMe(
      `Step: ${this.name} -> TC: ${
        this.tcName
      } at ${new Date()} method: 'beforeRun'`
    )
  }

  /**
   * This method will be called just before the run method
   */
  async run() {
    return new Promise(resolve => {
      // const min = 5
      // const max = 100
      // const time = Math.floor(Math.random() * (max - min)) + min
      const time = 4000
      setTimeout(() => {
        this.logMe(
          `Step: ${this.name} -> TC: ${
            this.tcName
          } at ${new Date()} method: 'run'`
        )

        resolve(1)
      }, time)
    })
  }

  /**
   * This method will be called just after the run is finished
   */
  async afterRun() {
    this.logMe(
      `Step: ${this.name} -> TC: ${
        this.tcName
      } at ${new Date()} method: 'afterRun'`
    )
  }

  /**
   * This method will be called when the step is finished
   */
  async end() {
    this.logMe(
      `Step: ${this.name} -> TC: ${this.tcName} at ${new Date()} method: 'end'`
    )
  }

  logMe(msg) {
    if (this.console) {
      // eslint-disable-next-line no-console
      console.log(msg)
    }
  }
}
