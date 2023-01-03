import fs from 'fs'
import path from 'path'
import util from 'util'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { StepTree } from '../../src/steps/StepTree'
import { createStepTreeGraph } from './createStepTreeGraph'

const rm = util.promisify(rimraf)

const FIXTUTRES = path.join(__dirname, '..', 'fixtures', 'steps', 'StepTree')
const VOLATILE = path.join(__dirname, '..', 'volatile', 'steps', 'StepTree')

beforeAll(async () => {
  await rm(VOLATILE)
  await mkdirp(VOLATILE)
})

const TESTS = [
  {
    name: 'tc1: single graph',
    inputFile: 'tc1.json',
    expectedFile: 'tc1_expected.dot'
  },
  {
    name: 'tc2: two different graphs',
    inputFile: 'tc2.json',
    expectedFile: 'tc2_expected.dot'
  },
  {
    name: 'tc3: complex with many pathes',
    inputFile: 'tc3.json',
    expectedFile: 'tc3_expected.dot'
  }
]

test.each(TESTS)('$name', async ({ inputFile, expectedFile }) => {
  const fileInput = path.join(FIXTUTRES, inputFile)
  const fileGraphExpected = path.join(FIXTUTRES, expectedFile)
  const fileGraphOut = path.join(VOLATILE, expectedFile)

  const input: string[][] = JSON.parse(
    await fs.promises.readFile(fileInput, 'utf8')
  )
  const expectedGraph = await fs.promises.readFile(fileGraphExpected, 'utf8')

  const stepTree = new StepTree()
  for (const stepNames of input) {
    stepTree.add(stepNames)
  }

  stepTree.setLongestPathToRootForAllNodes()

  const graph = createStepTreeGraph(stepTree.nodeTree)

  await fs.promises.writeFile(fileGraphOut, graph, 'utf8')
  expect(graph).toEqual(expectedGraph)
})
