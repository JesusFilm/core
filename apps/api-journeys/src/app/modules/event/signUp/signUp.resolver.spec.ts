import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { VisitorService } from '../../visitor/visitor.service'
import { SignUpSubmissionEventResolver } from './signUp.resolver'

describe('SignUpEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: SignUpSubmissionEventResolver, vService: VisitorService

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

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      update: jest.fn(() => null)
    })
  }

  const response = {
    visitor: { id: 'visitor.id', name: 'test name', email: 'test@email.com' },
    journeyId: 'journey.id'
  }

  const withName = {
    visitor: { id: 'withName.id', name: 'test name' },
    journeyId: 'journey.id'
  }

  const withEmail = {
    visitor: { id: 'withEmail.id', email: 'test@email.com' },
    journeyId: 'journey.id'
  }

  const newVisitorResponse = {
    visitor: { id: 'newVisitor.id' },
    journeyId: 'journey.id'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignUpSubmissionEventResolver, eventService, visitorService]
    }).compile()
    resolver = module.get<SignUpSubmissionEventResolver>(
      SignUpSubmissionEventResolver
    )
    vService = module.get<VisitorService>(VisitorService)
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
        __typename: 'SignUpSubmissionEvent',
        visitorId: 'visitor.id',
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

      expect(vService.update).toHaveBeenCalledWith('newVisitor.id', {
        name: input.name,
        email: input.email
      })
    })

    it('should update visitor name with input if visitor does not have name', async () => {
      await resolver.signUpSubmissionEventCreate('withEmail.id', input)

      expect(vService.update).toHaveBeenCalledWith('withEmail.id', {
        name: input.name
      })
    })

    it('should update visitor email with input if visitor does not have email', async () => {
      await resolver.signUpSubmissionEventCreate('withName.id', input)

      expect(vService.update).toHaveBeenCalledWith('withName.id', {
        email: input.email
      })
    })
  })
})
