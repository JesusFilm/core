import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { ButtonClickEventCreateInput } from '../../../__generated__/graphql'
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

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const response = {
    visitor: { id: 'visitor.id' },
    journeyId: 'journey.id'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ButtonClickEventResolver, eventService]
    }).compile()
    resolver = module.get<ButtonClickEventResolver>(ButtonClickEventResolver)
  })

  describe('buttonClickEventCreate', () => {
    it('returns ButtonClickEvent', async () => {
      const input: ButtonClickEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        label: 'Step name',
        value: 'Button label'
      }

      expect(await resolver.buttonClickEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'ButtonClickEvent',
        visitorId: 'visitor.id',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })
  })
})
