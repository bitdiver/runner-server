'use strict'

import {
  SuiteDefinitionInterface,
  TestcaseDefinitionInterface,
  StepDefinitionInterface
} from '@bitdiver/definition'
import { StepRegistry } from '@bitdiver/model'
import { StepNormalLocal } from './StepNormalLocal'
import { StepSingleLocal } from './StepSingleLocal'
import { StepSingleRunOnError } from './StepSingleRunOnError'
import { StepRunOnError } from './StepRunOnError'
import { StepTestQueue } from './StepTestQueue'

const DEFAULT_TC_COUNT = 3
const DEFAULT_STEP_COUNT = 5

interface CreateSuiteOptions {
  // The amount of testcases to be created
  testcaseCount?: number

  // The amount of steps to be created
  stepCount?: number

  // This array defines which steps are single steps. Just set a value where a step should be a single step
  singleSteps?: number[]
}

/**
 * Creates a demo suite for testing.
 * The following params a properties in the options object
 * @param opts - The parameter as defined in @see CreateSuiteOptions
 * @returns suiteDefinition - The suite definition object
 */
export function createSuite(
  opts: CreateSuiteOptions
): SuiteDefinitionInterface {
  const param = {
    testcaseCount: DEFAULT_TC_COUNT,
    stepCount: DEFAULT_STEP_COUNT,
    singleSteps: [undefined, 1],
    ...opts
  }

  // -------------------------------
  // create the suite
  // -------------------------------
  const suite: SuiteDefinitionInterface = {
    name: 'test suite 1',
    description: 'Desc 1',
    executionMode: 'batch',
    steps: {},
    testcases: []
  }

  // -------------------------------
  // create the steps
  // -------------------------------
  const stepIds = []
  for (let i = 0; i < param.stepCount; i++) {
    let step: StepDefinitionInterface
    if (param.singleSteps[i] !== undefined) {
      step = {
        id: 'single',
        name: `Step single ${i + 1}`,
        description: `Desc for step ${i + 1}`
      }
    } else {
      step = {
        id: 'normal',
        name: `Step normal ${i + 1}`,
        description: `Desc for step ${i + 1}`
      }
    }

    suite.steps[step.name] = step
    stepIds.push(step.name)
  }

  // -------------------------------
  // create the test cases
  // -------------------------------
  for (let i = 0; i < param.testcaseCount; i++) {
    // create default testcase data
    const data = []
    for (let j = 0; j < stepIds.length; j++) {
      data.push({ tc: i + 1, step: j + 1 })
    }

    const tc: TestcaseDefinitionInterface = {
      name: `TC ${i + 1}`,
      description: `Description for testcase ${i + 1}`,
      steps: stepIds,
      data
    }

    suite.testcases.push(tc)
  }

  return suite
}

/**
 * Create a steop registry
 */
export function createRegistry(): StepRegistry {
  const stepRegistry = new StepRegistry()
  stepRegistry.registerStep({ stepName: 'normal', step: StepNormalLocal })
  stepRegistry.registerStep({ stepName: 'single', step: StepSingleLocal })
  stepRegistry.registerStep({ stepName: 'runOnError', step: StepRunOnError })
  stepRegistry.registerStep({ stepName: 'timerStep', step: StepTestQueue })
  stepRegistry.registerStep({
    stepName: 'singleRunOnError',
    step: StepSingleRunOnError
  })
  return stepRegistry
}
