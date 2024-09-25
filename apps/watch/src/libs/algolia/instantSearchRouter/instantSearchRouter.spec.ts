import { UiState } from 'instantsearch.js'

import { createInstantSearchRouter } from './instantSearchRouter'

describe('instantSearchRouter', () => {
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
      query: 'test query',
      refinementList: {
        languageEnglishName: ['English']
      }
    } as unknown as UiState

    it('should map state to route correctly', () => {
      const routeState =
        createInstantSearchRouter('indexName').stateMapping.stateToRoute(
          mockUiState
        )

      expect(routeState).toEqual({
        query: 'test query',
        refinementList: {
          languageEnglishName: ['English']
        }
      })
    })

    it('should map route to state correctly', () => {
      const uiState =
        createInstantSearchRouter('indexName').stateMapping.routeToState(
          mockRouteState
        )

      expect(uiState).toEqual({
        indexName: mockRouteState
      })
    })
  })
})
