import { queue } from '../../workers/email/queue'

import { verifyUser } from './verifyUser'

const removeJob = jest.fn()
jest.mock('../../workers/email/queue', () => ({
  __esModule: true,
  queue: {
    add: jest.fn(),
    getJob: jest
      .fn()
      .mockImplementation((jobId: string) =>
        jobId === 'userId'
          ? { data: { token: 'token' }, remove: removeJob }
          : null
      )
  }
}))

describe('verifyUser', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should send an email with the correct subject and body', async () => {
    const email = 'tav@example.com'
    const userId = 'userId'
    await verifyUser(userId, email)
    expect(queue.add).toHaveBeenCalledWith(
      'verifyUser',
      {
        email,
        token: expect.any(String),
        userId
      },
      {
        jobId: expect.any(String),
        removeOnComplete: {
          age: 24 * 3600 // keep up to 24 hours
        },
        removeOnFail: {
          age: 24 * 3600
        }
      }
    )
  })

  it('should create new job if none exists', async () => {
    const email = 'tav@example.com'
    const userId = 'userId2'
    await verifyUser(userId, email)
    expect(removeJob).not.toHaveBeenCalled()
    expect(queue.add).toHaveBeenCalledWith(
      'verifyUser',
      {
        email,
        token: expect.any(String),
        userId
      },
      {
        jobId: expect.any(String),
        removeOnComplete: {
          age: 24 * 3600 // keep up to 24 hours
        },
        removeOnFail: {
          age: 24 * 3600
        }
      }
    )
  })

  it('should use example token', async () => {
    process.env.EXAMPLE_EMAIL_TOKEN = '123456'
    const email = 'tav@example.com'
    const userId = 'userId2'
    await verifyUser(userId, email)
    expect(removeJob).not.toHaveBeenCalled()
    expect(queue.add).toHaveBeenCalledWith(
      'verifyUser',
      {
        email,
        token: '123456',
        userId
      },
      {
        jobId: expect.any(String),
        removeOnComplete: {
          age: 24 * 3600 // keep up to 24 hours
        },
        removeOnFail: {
          age: 24 * 3600
        }
      }
    )
  })
})
