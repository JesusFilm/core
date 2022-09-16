import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { TextFieldSubmissionEventResolver } from './textField.resolver'

describe('TextFieldEventResolver', () => {
  let resolver: TextFieldSubmissionEventResolver

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
      providers: [TextFieldSubmissionEventResolver, eventService]
    }).compile()
    resolver = module.get<TextFieldSubmissionEventResolver>(
      TextFieldSubmissionEventResolver
    )
  })

  describe('textFieldSubmissionEventCreate', () => {
    it('returns TextFieldSubmissionEvent', async () => {
      expect(
        await resolver.textFieldSubmissionEventCreate('userId', input)
      ).toEqual({
        ...input,
        __typename: 'TextFieldSubmissionEvent',
        userId: 'userId'
      })
    })
  })
})
