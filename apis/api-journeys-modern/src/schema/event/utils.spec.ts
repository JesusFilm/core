import {
  __setEmailQueueForTests,
  resetEventsEmailDelay,
  sendEventsEmail
} from './utils'

describe('event utils email queue helpers', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.resetModules()
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  describe('sendEventsEmail', () => {
    it('adds a job when none exists', async () => {
      const add = jest.fn()
      const getJob = jest.fn().mockResolvedValue(null)
      __setEmailQueueForTests({ add, getJob, remove: jest.fn() })

      await sendEventsEmail('journey-id', 'visitor-id')

      expect(getJob).toHaveBeenCalledWith('visitor-event-journey-id-visitor-id')
      expect(add).toHaveBeenCalledWith(
        'visitor-event',
        { journeyId: 'journey-id', visitorId: 'visitor-id' },
        {
          jobId: 'visitor-event-journey-id-visitor-id',
          delay: 120000,
          removeOnComplete: true,
          removeOnFail: { age: 86400, count: 50 }
        }
      )
    })

    it('removes existing job then adds a new one', async () => {
      const add = jest.fn()
      const remove = jest.fn()
      const getJob = jest.fn().mockResolvedValue({ id: 'existing' })
      __setEmailQueueForTests({ add, getJob, remove })

      await sendEventsEmail('journey-id', 'visitor-id')

      expect(remove).toHaveBeenCalledWith('visitor-event-journey-id-visitor-id')
      expect(add).toHaveBeenCalled()
    })
  })

  describe('resetEventsEmailDelay', () => {
    it('changes delay to base when no custom delay provided', async () => {
      const changeDelay = jest.fn()
      const getJob = jest.fn().mockResolvedValue({ changeDelay })
      __setEmailQueueForTests({ getJob })

      await resetEventsEmailDelay('journey-id', 'visitor-id')

      expect(changeDelay).toHaveBeenCalledWith(120000)
    })

    it('changes delay to provided delay when greater than base', async () => {
      const changeDelay = jest.fn()
      const getJob = jest.fn().mockResolvedValue({ changeDelay })
      __setEmailQueueForTests({ getJob })

      await resetEventsEmailDelay('journey-id', 'visitor-id', 180)

      expect(changeDelay).toHaveBeenCalledWith(180000)
    })

    it('keeps base delay when provided delay less than base', async () => {
      const changeDelay = jest.fn()
      const getJob = jest.fn().mockResolvedValue({ changeDelay })
      __setEmailQueueForTests({ getJob })

      await resetEventsEmailDelay('journey-id', 'visitor-id', -1)

      expect(changeDelay).toHaveBeenCalledWith(120000)
    })
  })
})
