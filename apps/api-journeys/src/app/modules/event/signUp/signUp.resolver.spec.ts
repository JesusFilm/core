import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
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
      getVisitorByUserIdAndJourneyId: jest.fn((userId) => {
        switch (userId) {
          case visitor.userId:
            return visitorWithId
          case newVisitor.userId:
            return newVisitorWithId
        }
      })
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block)
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      update: jest.fn(() => '')
    })
  }

  const input = {
    id: '1',
    blockId: '2',
    stepId: 'step.id',
    name: 'John Doe',
    email: 'john.doe@jesusfilm.org'
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id'
  }

  const visitor = {
    _key: 'visitor.id',
    userId: 'user.id',
    name: 'Robert Smith',
    email: 'robert.smith@jesusfilm.org'
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
        SignUpSubmissionEventResolver,
        eventService,
        blockService,
        visitorService
      ]
    }).compile()
    resolver = module.get<SignUpSubmissionEventResolver>(
      SignUpSubmissionEventResolver
    )
    vService = module.get<VisitorService>(VisitorService)
  })

  describe('signUpSubmissionEventCreate', () => {
    it('returns SignUpSubmissionEvent', async () => {
      expect(
        await resolver.signUpSubmissionEventCreate('user.id', input)
      ).toEqual({
        id: input.id,
        blockId: input.blockId,
        __typename: 'SignUpSubmissionEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: input.stepId,
        label: null,
        value: input.name,
        email: input.email
      })
      expect(vService.update).not.toHaveBeenCalled()
    })

    it('should update visitor with name and email if input is different', async () => {
      await resolver.signUpSubmissionEventCreate('newUser.id', input)

      expect(vService.update).toHaveBeenCalledWith(newVisitorWithId.id, {
        name: input.name,
        email: input.email
      })
    })
  })
})
