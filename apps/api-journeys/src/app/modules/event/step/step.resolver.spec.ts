import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { StepViewEventResolver, StepNextEventResolver } from './step.resolver'

describe('StepViewEventResolver', () => {
  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input)
    })
  }

  describe('stepResolver', () => {
    describe('stepViewEventCreate', () => {
      let resolver: StepViewEventResolver

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [StepViewEventResolver, eventService]
        }).compile()
        resolver = module.get<StepViewEventResolver>(StepViewEventResolver)
      })

      it('returns StepViewEvent', async () => {
        const input = {
          id: '1',
          blockId: 'block.id',
          previousBlockId: 'previousBlock.id',
          journeyId: 'journey.id'
        }

        expect(await resolver.stepViewEventCreate('userId', input)).toEqual({
          ...input,
          __typename: 'StepViewEvent',
          userId: 'userId'
        })
      })
    })
  })

  describe('stepNextEventCreate', () => {
    let resolver: StepNextEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepNextEventResolver, eventService]
      }).compile()
      resolver = module.get<StepNextEventResolver>(StepNextEventResolver)
    })

    it('returns StepNextEvent', async () => {
      const input = {
        id: '1',
        blockId: 'block.id',
        nextStepId: 'step2.id'
      }

      expect(await resolver.stepNextEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'StepNextEvent',
        userId: 'userId'
        // createdAt: new Date().toISOString()
      })
    })
  })
})
