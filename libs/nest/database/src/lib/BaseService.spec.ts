import { Injectable } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { AqlQuery } from 'arangojs/aql'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import { ArrayCursor } from 'arangojs/cursor'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import omit from 'lodash/omit'

import { BaseService } from './BaseService'
import { mockCollectionUpdateAllResult } from './mock'

@Injectable()
class MockService extends BaseService {
  collection = this.db.collection('mocks')
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
  let service: MockService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  beforeEach(async () => {
    db = mockDeep()
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
    collectionMock = mockDeep()
    service.collection = collectionMock
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('load', () => {
    it('should call getByIds with _key', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { bindVars } = q as unknown as AqlQuery
        expect(bindVars).toEqual({
          value0: [block._key]
        })
        return { all: () => [block] } as unknown as ArrayCursor
      })
      expect(await service.load(block._key)).toEqual(blockResponse)
    })
  })

  describe('loadMany', () => {
    it('should call getByIds with _keys', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { bindVars } = q as unknown as AqlQuery
        expect(bindVars).toEqual({
          value0: [block._key, block2._key]
        })
        return { all: () => [block2, block] } as unknown as ArrayCursor
      })
      expect(await service.loadMany([block._key, block2._key])).toEqual([
        blockResponse,
        blockResponse2
      ])
    })
  })

  describe('getByIds', () => {
    it('should return items by id collection', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toBe(`
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

  describe('updateAll', () => {
    it('should return updated objects', async () => {
      collectionMock.updateAll.mockReturnValue(
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
})
