import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { ButtonClickEventCreateInput } from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'
import { ButtonClickEventResolver } from './button.resolver'

describe('ButtonClickEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: ButtonClickEventResolver

  const input: ButtonClickEventCreateInput = {
    id: '1',
    blockId: 'block.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      getStepHeader: jest.fn(() => 'header')
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block)
    })
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id',
    label: 'label'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ButtonClickEventResolver, eventService, blockService]
    }).compile()
    resolver = module.get<ButtonClickEventResolver>(ButtonClickEventResolver)
  })

  describe('buttonClickEventCreate', () => {
    it('returns ButtonClickEvent', async () => {
      expect(await resolver.buttonClickEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'ButtonClickEvent',
        userId: 'userId',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id',
        stepName: 'header',
        buttonLabel: 'label',
        teamId: 'team.id' // TODO: update
      })
    })
  })
})
