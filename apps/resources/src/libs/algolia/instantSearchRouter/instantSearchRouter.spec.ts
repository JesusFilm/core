import { UiState } from 'instantsearch.js'

import { createInstantSearchRouter } from './instantSearchRouter'

describe('instantSearchRouter', () => {
  const indexName = 'indexName'

  describe('createInstantSearchRouter', () => {
    const mockUiState: UiState = {
      indexName: {
        query: 'test query',
        refinementList: {
          languageEnglishName: ['English']
        }
      }
    }

    const mockRouteState = {
      [indexName]: {
        query: 'test query',
        refinementList: {
          languageEnglishName: ['English']
        }
      }
    }

    it('should map state to route correctly', () => {
      const routeState = createInstantSearchRouter({
        indexName
      }).stateMapping?.stateToRoute(mockUiState)

      expect(routeState).toEqual({
        query: 'test query',
        refinementList: {
          languageEnglishName: ['English']
        }
      })
    })

    it('should map route to state correctly', () => {
      const uiState = createInstantSearchRouter({
        indexName
      }).stateMapping?.routeToState(mockRouteState)

      expect(uiState).toEqual({
        indexName: {
          query: 'test query',
          refinementList: {
            languageEnglishName: ['English']
          }
        }
      })
    })

    it('should correctly map refinements using the provided mapRefinements function', () => {
      const mockMapRefinements = jest.fn((indexUiState) => ({
        myCustomField: indexUiState.refinementList?.myCustomField
      }))

      const router = createInstantSearchRouter({
        indexName,
        mapRefinements: mockMapRefinements
      })

      const expectedState = {
        query: 'test query',
        refinementList: { myCustomField: ['value1', 'value2'] }
      }
      const uiState = {
        [indexName]: expectedState
      }

      const result = router.stateMapping?.stateToRoute(uiState)

      expect(mockMapRefinements).toHaveBeenCalledWith(uiState[indexName])
      expect(result).toEqual(expectedState)
    })
  })

  describe('createInstantSearchRouter with default parameters', () => {
    const envBackup = process.env

    beforeEach(() => {
      process.env.NEXT_PUBLIC_ALGOLIA_INDEX = indexName
      process.env.NEXT_PUBLIC_WATCH_URL = 'https://default-server-url.com'
    })

    afterEach(() => {
      process.env = { ...envBackup }
    })

    it('should use default values when called with no arguments', () => {
      const router = createInstantSearchRouter()

      const uiState = {
        indexName: {
          query: 'test query',
          refinementList: { languageEnglishName: ['English', 'Spanish'] }
        }
      }

      const result = router.stateMapping?.stateToRoute(uiState)

      expect(result).toEqual({
        query: 'test query',
        refinementList: { languageEnglishName: ['English', 'Spanish'] }
      })
    })

    it('should use default mapRefinements function', () => {
      const router = createInstantSearchRouter()

      const uiState = {
        indexName: {
          refinementList: { languageEnglishName: ['French'] }
        }
      }

      const result = router.stateMapping?.stateToRoute(uiState)

      expect(result?.refinementList).toEqual({
        languageEnglishName: ['French']
      })
    })

    it('should handle an undefined refinement list gracefully', () => {
      const router = createInstantSearchRouter()

      const uiState = {
        indexName: {
          query: 'test query',
          refinementList: undefined
        }
      }

      const result = router.stateMapping?.stateToRoute(uiState)

      expect(result).toEqual({
        query: 'test query',
        refinementList: { languageEnglishName: undefined }
      })
    })
  })
})
