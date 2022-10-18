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

  const input: ButtonClickEventCreateInput = {
    id: '1',
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
    it('returns ButtonClickEvent', async () => {
      const info = {
        deviceInfo: 'some data',
        locationInfo: '000.00.000'
      }

      expect(
        await resolver.buttonClickEventCreate('userId', info, input)
      ).toEqual({
        ...input,
        info,
        __typename: 'ButtonClickEvent',
        userId: 'userId',
        createdAt: new Date().toISOString()
      })
    })
  })
})
