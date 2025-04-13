import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../../lib/prisma.service'

import { DbEvent, EventResolver } from './event.resolver'

describe('EventResolver', () => {
  let resolver: EventResolver

  describe('__resolveType', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [EventResolver, PrismaService]
      }).compile()
      resolver = module.get<EventResolver>(EventResolver)
    })

    it('returns __typename', () => {
      const event = {
        __typename: 'TextResponseSubmissionEvent'
      } as unknown as DbEvent

      expect(resolver.__resolveType(event)).toBe('TextResponseSubmissionEvent')
    })
  })
})
