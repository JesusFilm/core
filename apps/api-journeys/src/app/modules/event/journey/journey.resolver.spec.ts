import { Test, TestingModule } from '@nestjs/testing'

import { keyAsId } from '@core/nest/decorators/KeyAsId'

import { JourneyViewEventCreateInput } from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { VisitorService } from '../../visitor/visitor.service'
import { EventService } from '../event.service'

import { JourneyViewEventResolver } from './journey.resolver'

describe('JourneyViewEventResolver', () => {
  let resolver: JourneyViewEventResolver, prismaService: PrismaService

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event)
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getByUserIdAndJourneyId: jest.fn((userId) => {
        switch (userId) {
          case visitor.userId:
            return { visitor: visitorWithId }
          case newVisitor.userId:
            return { visitor: newVisitorWithId }
        }
      })
    })
  }

  const input: JourneyViewEventCreateInput = {
    id: '1',
    journeyId: 'journey.id',
    label: 'journey title',
    value: '503'
  }

  const userAgent = 'device info'

  const visitor = {
    _key: 'visitor.id',
    userId: 'user.id',
    userAgent: '000'
  }

  const newVisitor = {
    _key: 'newVisitor.id',
    userId: 'newUser.id'
  }

  const visitorWithId = keyAsId(visitor)
  const newVisitorWithId = keyAsId(newVisitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyViewEventResolver,
        eventService,
        visitorService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<JourneyViewEventResolver>(JourneyViewEventResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.journey.findUnique = jest
      .fn()
      .mockImplementationOnce((req) => {
        if (req.where.id === input.journeyId) {
          return { id: input.id }
        }
        return null
      })
    prismaService.journeyVisitor.upsert = jest.fn().mockResolvedValueOnce(null)
    prismaService.visitor.update = jest.fn().mockResolvedValueOnce(null)
  })

  describe('JourneyViewEventCreate', () => {
    it('returns journeyViewEvent', async () => {
      expect(
        await resolver.journeyViewEventCreate('user.id', userAgent, input)
      ).toEqual({
        ...input,
        typename: 'JourneyViewEvent',
        visitor: {
          connect: { id: visitorWithId.id }
        }
      })
    })

    it('should update user agent on visitor if visitor does not have a user agent', async () => {
      await resolver.journeyViewEventCreate('newUser.id', userAgent, input)

      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        where: { id: 'newVisitor.id' },
        data: {
          userAgent
        }
      })
    })

    it('should throw error if journey doesnt exist', async () => {
      const errorInput = {
        ...input,
        journeyId: 'anotherJourney.id'
      }

      await expect(
        async () =>
          await resolver.journeyViewEventCreate(
            'user.id',
            userAgent,
            errorInput
          )
      ).rejects.toThrow('Journey does not exist')
    })

    it('should throw error if visitor doesnt exist', async () => {
      await expect(
        async () =>
          await resolver.journeyViewEventCreate(
            'anotherUser.id',
            userAgent,
            input
          )
      ).rejects.toThrow('Visitor does not exist')
    })
  })

  describe('language', () => {
    it('returns object for federation', () => {
      expect(resolver.language({ value: 'languageId' })).toEqual({
        __typename: 'Language',
        id: 'languageId'
      })
    })

    it('when no languageId returns object for federation with default', () => {
      expect(resolver.language({})).toEqual({
        __typename: 'Language',
        id: '529'
      })
    })
  })
})
