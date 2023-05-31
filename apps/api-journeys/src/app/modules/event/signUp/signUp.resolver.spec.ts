import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { PrismaService } from '../../../lib/prisma.service'
import { SignUpSubmissionEventResolver } from './signUp.resolver'

describe('SignUpEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: SignUpSubmissionEventResolver, prisma: PrismaService

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input),
      validateBlockEvent: jest.fn((userId) => {
        switch (userId) {
          case 'user.id':
            return response
          case 'withName.id':
            return withName
          case 'withEmail.id':
            return withEmail
          default:
            return newVisitorResponse
        }
      })
    })
  }

  const response = {
    visitor: { id: 'visitor.id', name: 'test name', email: 'test@email.com' },
    journeyVisitor: {
      journeyId: 'journey.id',
      visitorId: 'visitor.id',
      activityCount: 0
    },
    journeyId: 'journey.id'
  }

  const withName = {
    visitor: { id: 'withName.id', name: 'test name' },
    journeyVisitor: {
      journeyId: 'journey.id',
      visitorId: 'visitor.id',
      activityCount: 0
    },
    journeyId: 'journey.id'
  }

  const withEmail = {
    visitor: { id: 'withEmail.id', email: 'test@email.com' },
    journeyVisitor: {
      journeyId: 'journey.id',
      visitorId: 'visitor.id',
      activityCount: 0
    },
    journeyId: 'journey.id'
  }

  const newVisitorResponse = {
    visitor: { id: 'newVisitor.id' },
    journeyVisitor: {
      journeyId: 'journey.id',
      visitorId: 'visitor.id',
      activityCount: 0
    },
    journeyId: 'journey.id'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignUpSubmissionEventResolver, eventService, PrismaService]
    }).compile()
    resolver = module.get<SignUpSubmissionEventResolver>(
      SignUpSubmissionEventResolver
    )
    prisma = module.get<PrismaService>(PrismaService)
    prisma.visitor.update = jest.fn().mockResolvedValueOnce(null)
    prisma.journeyVisitor.update = jest.fn().mockResolvedValueOnce(null)
  })

  describe('signUpSubmissionEventCreate', () => {
    const input = {
      id: '1',
      blockId: 'block.id',
      stepId: 'step.id',
      name: 'John Doe',
      email: 'john.doe@jesusfilm.org'
    }

    it('returns SignUpSubmissionEvent', async () => {
      expect(
        await resolver.signUpSubmissionEventCreate('user.id', input)
      ).toEqual({
        id: input.id,
        blockId: input.blockId,
        typename: 'SignUpSubmissionEvent',
        visitor: {
          connect: { id: 'visitor.id' }
        },
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id',
        stepId: input.stepId,
        label: null,
        value: input.name,
        email: input.email
      })
    })

    it('should update visitor', async () => {
      await resolver.signUpSubmissionEventCreate('newVisitor.id', input)

      expect(prisma.visitor.update).toHaveBeenCalledWith({
        where: { id: 'newVisitor.id' },
        data: {
          name: input.name,
          email: input.email
        }
      })
    })

    it('should update visitor name with input if visitor does not have name', async () => {
      await resolver.signUpSubmissionEventCreate('withEmail.id', input)

      expect(prisma.visitor.update).toHaveBeenCalledWith({
        where: { id: 'withEmail.id' },
        data: {
          name: input.name
        }
      })
    })

    it('should update visitor email with input if visitor does not have email', async () => {
      await resolver.signUpSubmissionEventCreate('withName.id', input)

      expect(prisma.visitor.update).toHaveBeenCalledWith({
        where: { id: 'withName.id' },
        data: {
          email: input.email
        }
      })
    })
  })
})
