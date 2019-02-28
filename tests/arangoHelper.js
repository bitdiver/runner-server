import { Database, aql } from 'arangojs'

let arangoDb

export function getArangoDb(opts = {}) {
  if (arangoDb === undefined) {
    const scheme = opts.scheme || 'http'
    const host = opts.hostname || 'localhost'
    const port = opts.port || 8529
    const database = opts.database || 'log'
    const username = opts.username || 'log'
    const password = opts.password || 'log'

    const url = `${scheme}://${host}:${port}`

    arangoDb = new Database({ url })
    arangoDb.useDatabase(database)
    arangoDb.useBasicAuth(username, password)
  }
  return arangoDb
}

/**
 * Prints the names of all the existing collections
 * @param db {object} The arangoDB object
 */
export async function printCollections(db) {
  // eslint-disable-next-line no-console
  console.log('printCollections')
  const collections = await db.listCollections()
  // eslint-disable-next-line no-console
  console.log('collections', collections)
  collections.forEach(collection => {
    // eslint-disable-next-line no-console
    console.log(`Collection => ${collection}`)
  })
}

/**
 * Loads the data of all the tables and puts them together
 */
export async function retrieveData(db) {
  const runLogDataQuery = aql`
  FOR doc IN runLog
      SORT doc.meta.logTime
      RETURN doc
  `

  const tcLogDataQuery = aql`
  FOR doc IN testcaseLog
      SORT doc.meta.logTime
      RETURN doc
  `

  const stepLogDataQuery = aql`
  FOR doc IN stepLog
      SORT doc.meta.logTime
      RETURN doc
  `

  const runColl = db.collection('run')
  const tcColl = db.collection('testcase')
  const stepColl = db.collection('step')

  const runCursor = await runColl.all()
  const runLogCursor = await db.query(runLogDataQuery)
  const runData = await runCursor.all()
  const runLogData = await runLogCursor.all()

  const tcCursor = await tcColl.all()
  const tcLogCursor = await db.query(tcLogDataQuery)
  const tcData = await tcCursor.all()
  const tcLogData = await tcLogCursor.all()

  const stepCursor = await stepColl.all()
  const stepLogCursor = await db.query(stepLogDataQuery)
  const stepData = await stepCursor.all()
  const stepLogData = await stepLogCursor.all()

  return { runData, runLogData, tcData, tcLogData, stepData, stepLogData }
}
