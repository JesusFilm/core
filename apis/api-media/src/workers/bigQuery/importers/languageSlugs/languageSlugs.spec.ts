import { GET_LANGUAGE_SLUGS, apollo } from './languageSlugs'

import { getLanguageSlugs, importLanguageSlugs } from '.'

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

describe('bigQuery/importers/languageSlugs', () => {
  describe('importLanguageSlugs', () => {
    it('should import language slugs from api-languages', async () => {
      const cleanup = await importLanguageSlugs()
      expect(getLanguageSlugs()).toEqual({
        '529': 'english'
      })
      cleanup()
      expect(getLanguageSlugs()).toEqual({})
      expect(apollo.query).toHaveBeenCalledWith({
        query: GET_LANGUAGE_SLUGS
      })
    })
  })
})
