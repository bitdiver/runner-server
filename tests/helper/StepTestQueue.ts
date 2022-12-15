export class StepTestQueue {
  name: string
  tcName: string
  console: boolean = false
  constructor(opts: { name: string; tcName: string; console?: boolean }) {
    this.name = opts.name
    this.tcName = opts.tcName
    this.console = opts.console ?? false
  }

  async logInfo(msg: string): Promise<void> {
    this.logMe(
      `Step: ${this.name} -> TC: ${
        this.tcName
      } at ${new Date()} method: 'logInfo' \t ${msg}`
    )
  }

  /**
   * This method will be called when the step starts.
   */
  async start(): Promise<void> {
    this.logMe(
      `Step: ${this.name} -> TC: ${
        this.tcName
      } at ${new Date()} method: 'start'`
    )
  }

  /**
   * This method will be called just before the run method
   */
  async beforeRun(): Promise<void> {
    this.logMe(
      `Step: ${this.name} -> TC: ${
        this.tcName
      } at ${new Date()} method: 'beforeRun'`
    )
  }

  /**
   * This method will be called just before the run method
   */
  async run(): Promise<void> {
    return await new Promise((resolve) => {
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

        resolve()
      }, time)
    })
  }

  /**
   * This method will be called just after the run is finished
   */
  async afterRun(): Promise<void> {
    this.logMe(
      `Step: ${this.name} -> TC: ${
        this.tcName
      } at ${new Date()} method: 'afterRun'`
    )
  }

  /**
   * This method will be called when the step is finished
   */
  async end(): Promise<void> {
    this.logMe(
      `Step: ${this.name} -> TC: ${this.tcName} at ${new Date()} method: 'end'`
    )
  }

  logMe(msg: string): void {
    if (this.console) {
      // eslint-disable-next-line no-console
      console.log(msg)
    }
  }
}
