import { getLogAdapter } from '../lib'
const LOG_ADAPTER = getLogAdapter()

const LOG_ADAPTER_LOG_LEVEL = 'warn'

test('Loglevel debug', async done => {
  const logMessage = {
    meta: {
      run: {
        start: 1533720241284,
      },
      logLevel: 'debug',
    },
    data: {},
  }

  expect(
    await LOG_ADAPTER._messageShouldBeLogged(
      logMessage.meta.logLevel,
      LOG_ADAPTER_LOG_LEVEL
    )
  ).toEqual(false)
  done()
})

test('Loglevel info', async done => {
  const logMessage = {
    meta: {
      run: {
        start: 1533720241284,
      },
      logLevel: 'info',
    },
    data: {},
  }
  expect(
    await LOG_ADAPTER._messageShouldBeLogged(
      logMessage.meta.logLevel,
      LOG_ADAPTER_LOG_LEVEL
    )
  ).toEqual(false)
  done()
})

test('Loglevel warn', async done => {
  const logMessage = {
    meta: {
      run: {
        start: 1533720241284,
      },
      logLevel: 'warn',
    },
    data: {},
  }

  expect(
    await LOG_ADAPTER._messageShouldBeLogged(
      logMessage.meta.logLevel,
      LOG_ADAPTER_LOG_LEVEL
    )
  ).toEqual(true)
  done()
})

test('Loglevel error', async done => {
  const logMessage = {
    meta: {
      run: {
        start: 1533720241284,
      },
      logLevel: 'error',
    },
    data: {},
  }

  expect(
    await LOG_ADAPTER._messageShouldBeLogged(
      logMessage.meta.logLevel,
      LOG_ADAPTER_LOG_LEVEL
    )
  ).toEqual(true)
  done()
})

test('LogLevel fatal', async done => {
  const logMessage = {
    meta: {
      run: {
        start: 1533720241284,
      },
      logLevel: 'fatal',
    },
    data: {},
  }

  expect(
    await LOG_ADAPTER._messageShouldBeLogged(
      logMessage.meta.logLevel,
      LOG_ADAPTER_LOG_LEVEL
    )
  ).toEqual(true)
  done()
})
