import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
  mockCollectionRemoveResult,
  mockDbQueryResult
} from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { LanguageService } from './language.service'

describe('LanguageService', () => {
  let service: LanguageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<LanguageService>(LanguageService)
    service.collection = mockDeep<DocumentCollection>()
  })

  const language = {
    _key: '1',
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

  describe('getAll', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [language, language])
      )
    })

    it('should retun an array of languages', async () => {
      expect(await service.getAll(1, 2)).toEqual([language, language])
    })
  })

  describe('save', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).save.mockReturnValue(
        mockCollectionSaveResult(service.collection, language)
      )
    })

    it('should return a language', async () => {
      expect(await service.save(language)).toEqual(language)
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).remove.mockReturnValue(
        mockCollectionRemoveResult(service.collection, language)
      )
    })

    it('should return a language', async () => {
      expect(await service.remove('1')).toEqual(language)
    })
  })
})
