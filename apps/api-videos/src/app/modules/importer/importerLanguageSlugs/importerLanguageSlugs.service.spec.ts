import { Test, TestingModule } from '@nestjs/testing'

import {
  GET_LANGUAGE_SLUGS,
  ImporterLanguageSlugsService,
  apollo
} from './importerLanguageSlugs.service'

jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    __esModule: true,
    ApolloClient: jest.fn().mockImplementation(() => ({
      query: jest.fn().mockResolvedValue({
        data: {
          languages: [
            {
              id: '529',
              slug: 'english'
            }
          ]
        }
      })
    })),
    InMemoryCache: jest.fn()
  }
})

describe('ImporterLanguageSlugsService', () => {
  let service: ImporterLanguageSlugsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImporterLanguageSlugsService]
    }).compile()

    service = module.get<ImporterLanguageSlugsService>(
      ImporterLanguageSlugsService
    )
  })

  describe('getLanguageSlugs', () => {
    it('should fill slugs from api-languages', async () => {
      await service.getLanguageSlugs()
      expect(service.slugs).toEqual({
        '529': 'english'
      })
      expect(apollo.query).toHaveBeenCalledWith({
        query: GET_LANGUAGE_SLUGS
      })
    })
  })
})
