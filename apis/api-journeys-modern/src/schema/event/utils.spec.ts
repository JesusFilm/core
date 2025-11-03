import { prismaMock } from '../../../test/prismaMock'

import {
  __setEmailQueueForTests,
  getEventContext,
  resetEventsEmailDelay,
  sendEventsEmail,
  validateBlock
} from './utils'

describe('event utils email queue helpers', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.resetModules()
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    __setEmailQueueForTests(undefined as any)
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

describe('event utils', () => {
  describe('validateBlock', () => {
    it('returns true when block exists, not deleted, and field matches', async () => {
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'blockId',
        parentBlockId: 'parent-1',
        journeyId: 'journey-1',
        deletedAt: null
      } as any)

      await expect(
        validateBlock('blockId', 'parent-1', 'parentBlockId')
      ).resolves.toBe(true)
      expect(prismaMock.block.findFirst).toHaveBeenCalledWith({
        where: { id: 'blockId', deletedAt: null }
      })
    })

    it('returns false when block does not exist', async () => {
      prismaMock.block.findFirst.mockResolvedValue(null as any)

      await expect(
        validateBlock('missing-block', 'parent-1', 'parentBlockId')
      ).resolves.toBe(false)
    })

    it('returns false when id is null', async () => {
      await expect(validateBlock(null, 'journey-1', 'journeyId')).resolves.toBe(
        false
      )
      expect(prismaMock.block.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('getEventContext', () => {
    it('throws when block or journey not found', async () => {
      prismaMock.block.findUnique.mockResolvedValue(null as any)

      await expect(getEventContext('blockId')).rejects.toThrow(
        'Block or Journey not found'
      )
    })
  })
})
