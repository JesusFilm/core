import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { DocumentCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { TypographyVariant } from '../../__generated__/graphql'
import { EventService } from './event.service'

describe('EventService', () => {
  let service: EventService, db: DeepMockProxy<Database>

  beforeEach(async () => {
    db = mockDeep<Database>()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<EventService>(EventService)
    service.collection = mockDeep<DocumentCollection>()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('getStepHeader', () => {
    const stepBlock = {
      _key: 'step1.id',
      __typename: 'StepBlock',
      parentOrder: 0
    }

    const cardBlock = {
      _key: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id'
    }

    const typogBlock = {
      _key: 'typog1.id',
      __typename: 'TypographyBlock',
      variant: TypographyVariant.h1,
      content: 'I am a header'
    }

    it('should return most important typog', async () => {
      const secondaryTypog = {
        ...typogBlock,
        _key: 'typog2.id',
        variant: TypographyVariant.body1,
        content: 'I am body text'
      }

      db.query.mockReturnValueOnce(mockDbQueryResult(db, [cardBlock])) // cardBlock query
      db.query.mockReturnValueOnce(
        mockDbQueryResult(db, [typogBlock, secondaryTypog])
      ) // typog block array query

      expect(await service.getStepHeader('card1.id')).toEqual(
        typogBlock.content
      )
    })

    it('should return step number of current step', async () => {
      const stepWithId = keyAsId(stepBlock)

      const card2 = {
        ...cardBlock,
        _key: 'card2.id',
        parentBlockId: 'step2.id'
      }

      const step2 = {
        ...stepWithId,
        _key: 'step2.id',
        parentOrder: 1
      }

      const step3 = {
        ...stepWithId,
        _key: 'step3.id',
        parentOrder: 2
      }

      db.query.mockReturnValueOnce(mockDbQueryResult(db, [card2])) // card block query
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [])) // typog blocks array query
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [step2])) // step block query
      db.query.mockReturnValueOnce(
        mockDbQueryResult(db, [step3, step2, stepBlock]) // reverse parentBlockOrder to test _orderBy
      ) // step blocks array query

      expect(await service.getStepHeader('card2.id')).toEqual('Step number 2')
    })
  })

  describe('getVisitorId', () => {
    it('should return visitor id', async () => {
      const visitor = {
        _key: 'visitor.id',
        userId: 'user.id',
        teamId: 'team.id'
      }

      const visitorWithId = keyAsId(visitor)

      db.query.mockReturnValueOnce(mockDbQueryResult(db, [visitorWithId]))
      expect(await service.getVisitorId('user.id', 'team.id')).toEqual(
        visitor._key
      )
    })
  })
})
