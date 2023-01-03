import fs from 'fs'
import path from 'path'
import util from 'util'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { StepTree } from '../../src/steps/StepTree'
import { StepSorter } from '../../src/steps/StepSorter'

const rm = util.promisify(rimraf)

const FIXTUTRES = path.join(__dirname, '..', 'fixtures', 'steps', 'StepSorter')
const VOLATILE = path.join(__dirname, '..', 'volatile', 'steps', 'StepSorter')

beforeAll(async () => {
  await rm(VOLATILE)
  await mkdirp(VOLATILE)
})

const TESTS = [
  {
    name: 'tc1: single graph',
    inputFile: 'tc1.json',
    expected: [
      '1',
      '2',
      '4',
      '3',
      '5',
      '7',
      '6',
      '8',
      '9',
      '10',
      '21',
      '11',
      '12'
    ]
  },
  {
    name: 'tc2: two different graphs',
    inputFile: 'tc2.json',
    expected: [
      '1',
      'a',
      '2',
      'b',
      'c',
      '4',
      '3',
      'd',
      '5',
      '7',
      'e',
      '6',
      '8',
      'g',
      'h',
      '9',
      '10',
      '21',
      '11',
      '12'
    ]
  },
  {
    name: 'tc3: complex with many pathes',
    inputFile: 'tc3.json',
    expected: [
      '1',
      '3',
      '2',
      '4',
      '5',
      '9',
      '6',
      '15',
      '7',
      '8',
      '10',
      '11',
      '12',
      '13',
      '14',
      '16',
      '17',
      '20',
      '18',
      '22',
      '21',
      '19',
      '25',
      '30',
      '31'
    ]
  }
]

test.each(TESTS)('$name', async ({ inputFile, expected }) => {
  const fileInput = path.join(FIXTUTRES, inputFile)

  const input: string[][] = JSON.parse(
    await fs.promises.readFile(fileInput, 'utf8')
  )

  const stepTree = new StepTree()
  for (const stepNames of input) {
    stepTree.add(stepNames)
  }

  const stepSorter = new StepSorter(stepTree)
  const steps = stepSorter.getSteps()
  expect(steps).toEqual(expected)
})
