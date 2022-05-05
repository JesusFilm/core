import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { ButtonClickEventResolver } from './button.resolver'

describe('ButtonClickEventResolver', () => {
  let resolver: ButtonClickEventResolver

  const event = {
    id: '1',
    __typename: 'ButtonClickEvent',
    blockId: 'block.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ButtonClickEventResolver, eventService]
    }).compile()
    resolver = module.get<ButtonClickEventResolver>(ButtonClickEventResolver)
  })

  describe('buttonClickEventCreate', () => {
    it('returns StepViewEvent', async () => {
      expect(await resolver.buttonClickEventCreate('userId', event)).toEqual({
        ...event,
        userId: 'userId'
      })
    })
  })
})
