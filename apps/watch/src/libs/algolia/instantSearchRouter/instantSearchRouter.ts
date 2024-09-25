import { Router, StateMapping, UiState } from 'instantsearch.js'
import singletonRouter from 'next/router'
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs'

interface NextRouter {
  router: Router
  stateMapping: StateMapping<UiState, UiState>
}

export function createInstantSearchRouter(
  indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX as string,
  serverUrl = process.env.NEXT_PUBLIC_WATCH_URL
): NextRouter {
  return {
    // Manages the URL paramers with instant search state
    router: createInstantSearchRouterNext({
      serverUrl,
      singletonRouter,
      routerOptions: {
        cleanUrlOnDispose: false
      }
    }),
    stateMapping: {
      stateToRoute(uiState) {
        const indexUiState = uiState[indexName]

        const stateRoute = {
          query: indexUiState.query,
          refinementList: {
            languageEnglishName:
              indexUiState.refinementList?.languageEnglishName
          }
        } as unknown as UiState

        return stateRoute
      },
      routeToState(routeState) {
        return {
          [indexName]: routeState
        }
      }
    }
  }
}
