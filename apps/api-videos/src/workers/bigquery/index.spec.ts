import { importLanguagesQueue } from './queue'
import { jobName } from './worker'

jest.mock('bullmq')
jest.mock('./queue', () => ({
  importLanguagesQueue: {
    add: jest.fn()
  }
}))

describe('bigquery', () => {
  let originalEnv = process.env

  beforeEach(() => {
    originalEnv = process.env
    jest.resetModules()
  })

  afterAll(() => {
    process.env = originalEnv
    jest.resetAllMocks()
  })

  it('should import queue', () => {
    // eslint-disable-next-line import/dynamic-import-chunkname
    expect(import('./queue')).toBeDefined()
  })

  it('should import worker', () => {
    // eslint-disable-next-line import/dynamic-import-chunkname
    expect(import('./worker')).toBeDefined()
  })

  it('should not import queue in development', () => {
    // eslint-disable-next-line import/dynamic-import-chunkname
    import('./index')
    expect(importLanguagesQueue.add).not.toHaveBeenCalled()
  })

  it.skip('should create a cron job in production', () => {
    process.env.NODE_ENV = 'production'
    // eslint-disable-next-line import/dynamic-import-chunkname
    import('./index')
    expect(importLanguagesQueue.add).toHaveBeenCalledWith(
      jobName,
      {},
      {
        removeOnComplete: {
          age: 3600 // keep up to 1 hour
        },
        removeOnFail: {
          age: 24 * 3600 // keep up to 24 hours
        },
        repeat: {
          pattern: '0 0 1 * * *' // Run every day at 1 in the morning
        }
      }
    )
  })
})
