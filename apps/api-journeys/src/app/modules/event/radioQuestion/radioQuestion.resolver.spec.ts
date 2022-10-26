import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
import { RadioQuestionSubmissionEventResolver } from './radioQuestion.resolver'

describe('RadioQuestionSubmissionEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: RadioQuestionSubmissionEventResolver

  const input = {
    id: '1',
    blockId: 'block.id',
    radioOptionBlockId: 'radioOptionBlock.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input),
      getStepHeader: jest.fn(() => 'header')
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn((blockId) =>
        [radioQuestionBlock, radioOptionBlock].find(({ id }) => id === blockId)
      )
    })
  }

  const radioQuestionBlock = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id'
  }

  const radioOptionBlock = {
    id: 'radioOptionBlock.id',
    label: 'option'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RadioQuestionSubmissionEventResolver,
        eventService,
        blockService
      ]
    }).compile()
    resolver = module.get<RadioQuestionSubmissionEventResolver>(
      RadioQuestionSubmissionEventResolver
    )
  })

  describe('radioQuestionSubmissionEventCreate', () => {
    it('returns RadioQuestionSubmissionEvent', async () => {
      expect(
        await resolver.radioQuestionSubmissionEventCreate('userId', input)
      ).toEqual({
        ...input,
        __typename: 'RadioQuestionSubmissionEvent',
        userId: 'userId',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id',
        stepName: 'header',
        selectedOption: 'option',
        teamId: 'team.id' // TODO: update
      })
    })
  })
})
