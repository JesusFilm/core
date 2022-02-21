import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockCollectionUpdateAllResult } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { Injectable } from '@nestjs/common'
import {
  ThemeMode,
  ThemeName
} from '../../../../journeys/ui/__generated__/globalTypes'
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
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  fullscreen: true
}

const block2 = {
  _key: '2',
  journeyId: '2',
  __typename: 'CardBlock',
  parentBlockId: '3',
  parentOrder: 2,
  backgroundColor: '#FFF',
  coverBlockId: '4',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  fullscreen: true
}

describe('Base Service', () => {
  let service: MockService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
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
      expect(await service.updateAll([block, block2])).toEqual([block, block2])
      expect(service.collection.updateAll).toHaveBeenCalledWith(
        [block, block2],
        { returnNew: true }
      )
    })
  })
})
