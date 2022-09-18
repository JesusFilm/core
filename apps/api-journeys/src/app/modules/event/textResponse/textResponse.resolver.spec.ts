import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { TextResponseSubmissionEventResolver } from './textResponse.resolver'

describe('TextResponseEventResolver', () => {
  let resolver: TextResponseSubmissionEventResolver

  const input = {
    id: '1',
    blockId: '2',
    field: 'My response'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextResponseSubmissionEventResolver, eventService]
    }).compile()
    resolver = module.get<TextResponseSubmissionEventResolver>(
      TextResponseSubmissionEventResolver
    )
  })

  describe('textResponseSubmissionEventCreate', () => {
    it('returns TextResponseSubmissionEvent', async () => {
      expect(
        await resolver.textResponseSubmissionEventCreate('userId', input)
      ).toEqual({
        ...input,
        __typename: 'TextResponseSubmissionEvent',
        userId: 'userId'
      })
    })
  })
})
