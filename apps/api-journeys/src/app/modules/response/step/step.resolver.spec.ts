import { Test, TestingModule } from '@nestjs/testing'
import { ResponseService } from '../response.service'
import { StepResponseResolver } from './step.resolver'

describe('StepResponseResolver', () => {
  let resolver: StepResponseResolver

  const response = {
    id: '1',
    __typename: 'StepResponse',
    blockId: 'block.id',
    userId: 'user.id',
    previousBlockId: 'previousBlock.id',
    journeyId: 'journey.id'
  }

  const responseService = {
    provide: ResponseService,
    useFactory: () => ({
      save: jest.fn(() => response)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StepResponseResolver, responseService]
    }).compile()
    resolver = module.get<StepResponseResolver>(StepResponseResolver)
  })

  describe('StepResponse', () => {
    it('returns StepResponse', async () => {
      expect(await resolver.stepResponseCreate(response)).toEqual(response)
    })
  })
})
