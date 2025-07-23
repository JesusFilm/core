import { GraphQLError } from 'graphql'

import {
  Block,
  JourneyVisitor,
  Visitor
} from '.prisma/api-journeys-modern-client'

import { prismaMock } from '../../../test/prismaMock'

import {
  getByUserIdAndJourneyId,
  validateBlock,
  validateBlockEvent
} from './event.service'

describe('Event Service Functions', () => {
  const block: Block = {
    id: 'block.id',
    typename: 'ButtonBlock',
    journeyId: 'journey.id',
    parentBlockId: null,
    parentOrder: null,
    label: null,
    placeholder: null,
    required: false,
    variant: null,
    color: null,
    size: null,
    startIconId: null,
    endIconId: null,
    backgroundColor: null,
    coverBlockId: null,
    fullscreen: null,
    themeMode: null,
    themeName: null,
    spacing: null,
    gap: null,
    direction: null,
    justifyContent: null,
    alignItems: null,
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
    submitLabel: null,
    submitIconId: null,
    action: null,
    src: null,
    alt: null,
    width: null,
    height: null,
    blurhash: null,
    scale: null,
    focalPoint: null,
    title: null,
    subtitle: null,
    description: null,
    startAt: null,
    endAt: null,
    muted: null,
    autoplay: null,
    posterBlockId: null,
    videoId: null,
    videoVariantLanguageId: null,
    source: null,
    duration: null,
    image: null,
    objectFit: null,
    content: null,
    deletedAt: null,
    updatedAt: new Date()
  }

  const step: Block = {
    ...block,
    id: 'step.id',
    typename: 'StepBlock'
  }

  const visitor: Visitor = {
    id: 'visitor.id',
    userId: 'user.id',
    countryCode: null,
    referrer: null,
    source: null,
    medium: null,
    campaign: null,
    userAgent: null,
    ip: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const journeyVisitor: JourneyVisitor = {
    id: 'journeyVisitor.id',
    journeyId: 'journey.id',
    visitorId: 'visitor.id',
    activityCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateBlockEvent', () => {
    beforeEach(() => {
      prismaMock.block.findUnique.mockImplementation((args: any) => {
        if (args.where.id === 'block.id') {
          return Promise.resolve(block) as any
        }
        if (args.where.id === 'step.id') {
          return Promise.resolve(step) as any
        }
        return Promise.resolve(null) as any
      })

      prismaMock.visitor.findFirst.mockImplementation((args: any) => {
        if (args.where.userId === 'user.id') {
          return Promise.resolve(visitor) as any
        }
        return Promise.resolve(null) as any
      })

      prismaMock.journeyVisitor.findUnique.mockResolvedValue(
        journeyVisitor as any
      )
      prismaMock.journeyVisitor.create.mockResolvedValue(journeyVisitor as any)
    })

    it('should return the visitor, journey visitor, journey id and block', async () => {
      const result = await validateBlockEvent('user.id', 'block.id', 'step.id')

      expect(result).toEqual({
        visitor,
        journeyVisitor,
        journeyId: 'journey.id',
        block
      })
    })

    it('should throw error if block does not exist', async () => {
      await expect(
        validateBlockEvent('user.id', 'nonexistent.id', 'step.id')
      ).rejects.toThrow('Block does not exist')
    })

    it('should throw error if visitor does not exist', async () => {
      await expect(
        validateBlockEvent('unknown.user', 'block.id', 'step.id')
      ).rejects.toThrow('Visitor does not exist')
    })

    it('should create journey visitor if it does not exist', async () => {
      prismaMock.journeyVisitor.findUnique.mockResolvedValueOnce(null)

      const result = await validateBlockEvent('user.id', 'block.id', 'step.id')

      expect(prismaMock.journeyVisitor.create).toHaveBeenCalledWith({
        data: {
          journeyId: 'journey.id',
          visitorId: 'visitor.id'
        }
      })
      expect(result).toEqual({
        visitor,
        journeyVisitor,
        journeyId: 'journey.id',
        block
      })
    })

    it('should throw error if step does not belong to the same journey as the block', async () => {
      prismaMock.block.findUnique.mockImplementation((args: any) => {
        if (args.where.id === 'block.id') {
          return Promise.resolve(block) as any
        }
        if (args.where.id === 'invalid.step.id') {
          return Promise.resolve({
            ...step,
            id: 'invalid.step.id',
            journeyId: 'different.journey.id'
          }) as any
        }
        return Promise.resolve(null) as any
      })

      await expect(
        validateBlockEvent('user.id', 'block.id', 'invalid.step.id')
      ).rejects.toThrow(
        'Step ID invalid.step.id does not exist on Journey with ID journey.id'
      )
    })
  })

  describe('validateBlock', () => {
    beforeEach(() => {
      prismaMock.block.findUnique.mockImplementation((args: any) => {
        if (args.where.id === 'step.id') {
          return Promise.resolve(step) as any
        }
        return Promise.resolve(null) as any
      })
    })

    it('should return true if step exists and belongs to journey', async () => {
      const result = await validateBlock('step.id', 'journey.id', 'journeyId')

      expect(result).toBe(true)
    })

    it('should return false if step does not exist', async () => {
      const result = await validateBlock(
        'invalid.id',
        'journey.id',
        'journeyId'
      )

      expect(result).toBe(false)
    })

    it('should return false if step does not belong to journey', async () => {
      const result = await validateBlock(
        'step.id',
        'other.journey.id',
        'journeyId'
      )

      expect(result).toBe(false)
    })

    it('should return false if id is null', async () => {
      const result = await validateBlock(null, 'journey.id', 'journeyId')

      expect(result).toBe(false)
    })
  })

  describe('getByUserIdAndJourneyId', () => {
    beforeEach(() => {
      prismaMock.visitor.findFirst.mockImplementation((args: any) => {
        if (args.where.userId === 'user.id') {
          return Promise.resolve(visitor) as any
        }
        return Promise.resolve(null) as any
      })

      prismaMock.journeyVisitor.findUnique.mockImplementation((args: any) => {
        if (
          args.where.journeyId_visitorId.journeyId === 'journey.id' &&
          args.where.journeyId_visitorId.visitorId === 'visitor.id'
        ) {
          return Promise.resolve(journeyVisitor) as any
        }
        return Promise.resolve(null) as any
      })
    })

    it('should return visitor and journey visitor', async () => {
      const result = await getByUserIdAndJourneyId('user.id', 'journey.id')

      expect(result).toEqual({
        visitor,
        journeyVisitor
      })
    })

    it('should return null if visitor does not exist', async () => {
      const result = await getByUserIdAndJourneyId('unknown.user', 'journey.id')

      expect(result).toBeNull()
    })

    it('should return null if journey visitor does not exist', async () => {
      const result = await getByUserIdAndJourneyId('user.id', 'unknown.journey')

      expect(result).toBeNull()
    })
  })
})
