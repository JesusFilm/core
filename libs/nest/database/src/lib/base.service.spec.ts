import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { DocumentCollection } from 'arangojs/collection'
import { Injectable } from '@nestjs/common'
import { omit } from 'lodash'
import { AqlQuery } from 'arangojs/aql'
import { ArrayCursor } from 'arangojs/cursor'

import { mockCollectionUpdateAllResult } from './dbMock'
import { BaseService } from './base.service'

@Injectable()
export class MockService extends BaseService {
  collection: DocumentCollection = this.db.collection('mocks')
}

const block = {
  _key: '1',
  journeyId: '2',
  __typename: 'CardBlock',
  parentBlockId: '3',
  parentOrder: 0,
  backgroundColor: '#FFF',
  coverBlockId: '4',
  themeMode: 'light',
  themeName: 'base',
  fullscreen: true
}

const blockResponse = omit(
  {
    id: '1',
    ...block
  },
  ['_key']
)

const block2 = {
  _key: '2',
  journeyId: '2',
  __typename: 'CardBlock',
  parentBlockId: '3',
  parentOrder: 2,
  backgroundColor: '#FFF',
  coverBlockId: '4',
  themeMode: 'light',
  themeName: 'base',
  fullscreen: true
}

const blockResponse2 = omit(
  {
    id: '2',
    ...block2
  },
  ['_key']
)

describe('Base Service', () => {
  let service: MockService
  let db: DeepMockProxy<Database>

  beforeEach(async () => {
    db = mockDeep<Database>()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<MockService>(MockService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('updateAll', () => {
    it('should return updated objects', async () => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).updateAll.mockReturnValue(
        mockCollectionUpdateAllResult(service.collection, [block, block2])
      )
      expect(await service.updateAll([block, block2])).toEqual([
        blockResponse,
        blockResponse2
      ])
      expect(service.collection.updateAll).toHaveBeenCalledWith(
        [block, block2],
        { returnNew: true }
      )
    })
  })

  describe('getByIds', () => {
    it('should return items by id collection', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(`
    FOR item IN undefined
      FILTER item._key IN @value0
      RETURN item`)
        expect(bindVars).toEqual({
          value0: [block._key, block2._key]
        })
        return { all: () => [block, block2] } as unknown as ArrayCursor
      })
      expect(await service.getByIds([block._key, block2._key])).toEqual([
        blockResponse,
        blockResponse2
      ])
    })
  })
})
