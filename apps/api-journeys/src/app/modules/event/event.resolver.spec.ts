import { Test, TestingModule } from '@nestjs/testing'
import { EventResolver } from './event.resolver'

describe('EventResolver', () => {
  let resolver: EventResolver

  describe('__resolveType', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [EventResolver]
      }).compile()
      resolver = module.get<EventResolver>(EventResolver)
    })

    it('returns __typename', () => {
      const event = {
        __typename: 'TextResponseSubmissionEvent'
      }
      expect(resolver.__resolveType(event)).toEqual(
        'TextResponseSubmissionEvent'
      )
    })
  })
})
