import { Test, TestingModule } from '@nestjs/testing'

import { Block } from '@core/prisma/journeys/client'

import { StepBlockResolver } from './step.resolver'

describe('StepBlockResolver', () => {
  let resolver: StepBlockResolver

  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    typename: 'StepBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    locked: true,
    nextBlockId: 'nextBlockId'
  } as unknown as Block

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StepBlockResolver]
    }).compile()
    resolver = module.get<StepBlockResolver>(StepBlockResolver)
  })

  describe('locked', () => {
    it('returns locked when true', () => {
      expect(resolver.locked({ ...block, locked: true })).toBe(true)
    })

    it('returns locked when false', () => {
      expect(resolver.locked({ ...block, locked: false })).toBe(false)
    })

    it('returns false when locked is null', () => {
      expect(resolver.locked({ ...block, locked: null })).toBe(false)
    })
  })
})
