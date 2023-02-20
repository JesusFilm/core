import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
  mockCollectionRemoveResult,
  mockDbQueryResult
} from '@core/nest/database/mock'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import { LanguageRecord, LanguageService } from './language.service'

describe('LanguageService', () => {
  let service: LanguageService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<
      DocumentCollection<LanguageRecord> & EdgeCollection<LanguageRecord>
    >

  beforeEach(async () => {
    db = mockDeep()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<LanguageService>(LanguageService)
    collectionMock = mockDeep()
    service.collection = collectionMock
  })

  const language = {
    id: '1',
    bscp47: 'TEC',
    iso3: 'TEC',
    nameNative: 'Teke, Central',
    name: [
      {
        value: 'Teke, Central',
        languageId: '529',
        primary: true
      }
    ]
  }

  const languageWithId = keyAsId(language)

  describe('getAll', () => {
    beforeEach(() => {
      db.query.mockReturnValue(
        mockDbQueryResult(service.db, [language, language])
      )
    })

    it('should retun an array of languages', async () => {
      expect(await service.getAll(1, 2)).toEqual([
        languageWithId,
        languageWithId
      ])
    })
  })

  describe('save', () => {
    beforeEach(() => {
      collectionMock.save.mockReturnValue(
        mockCollectionSaveResult(service.collection, {
          ...language,
          _key: language.id
        })
      )
    })

    it('should return a language', async () => {
      expect(await service.save(language)).toEqual(languageWithId)
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      collectionMock.remove.mockReturnValue(
        mockCollectionRemoveResult(service.collection, {
          ...language,
          _key: language.id
        })
      )
    })

    it('should return a language', async () => {
      expect(await service.remove('1')).toEqual(languageWithId)
    })
  })

  describe('getByBcp47', () => {
    beforeEach(() => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, [language]))
    })

    it('should return a language', async () => {
      expect(await service.getByBcp47('us')).toEqual(languageWithId)
    })
  })
})
