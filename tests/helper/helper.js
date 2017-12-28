'use strict'

import {
  SuiteDefinition,
  TestcaseDefinition,
  StepDefinition,
} from '@bitdiver/definition'
import { StepRegistry } from '@bitdiver/model'
import StepNormal from './StepNormal'
import StepSingle from './StepSingle'

/**
 * Creates a demo suite for testing.
 * The following params a properties in the options object
 * @param testcaseCount {number} The amount of testcases to be created
 * @param stepCount {number} The amount of steps to be created
 * @param singleSteps {array} This array defines which steps are single steps. Just set a value where a step should be a single step
 * @return suite {object} The suie definition object
 */
export function createSuite(opts = {}) {
  const param = {
    testcaseCount: 3,
    stepCount: 5,
    singleSteps: [undefined, 1],
    ...opts,
  }

  // create the suite
  const suite = new SuiteDefinition({
    name: 'test suite 1',
    description: 'Desc 1',
  })

  // create the testcases
  const testcases = []
  for (let i = 0; i < param.testcaseCount; i++) {
    const tc = new TestcaseDefinition({
      name: `TC ${i + 1}`,
      description: `Description for testcase ${i + 1}`,
    })
    testcases.push(tc)
  }
  suite.testcases = testcases

  // create the steps
  for (let i = 0; i < param.stepCount; i++) {
    let step
    if (param.singleSteps[i] !== undefined) {
      step = new StepDefinition({
        class: 'single',
        name: `Step single ${i + 1}`,
        description: `Desc for step ${i + 1}`,
      })
    } else {
      step = new StepDefinition({
        class: 'normal',
        name: `Step normal ${i + 1}`,
        description: `Desc for step ${i + 1}`,
      })
    }

    // create default testcase data
    for (let j = 0; j < param.testcaseCount; j++) {
      step.data.push({ tc: i + 1, step: j + 1 })
    }

    suite.steps.push(step)
  }

  return suite
}

/**
 * Create a steop registry
 */
export function createRegistry() {
  const stepRegistry = new StepRegistry()
  stepRegistry.registerStep('normal', StepNormal)
  stepRegistry.registerStep('single', StepSingle)

  return stepRegistry
}
