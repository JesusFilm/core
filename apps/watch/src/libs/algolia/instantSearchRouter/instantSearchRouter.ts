import { UiState } from 'instantsearch.js'
import { RouterProps } from 'instantsearch.js/es/middlewares'
import singletonRouter from 'next/router'
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs'

interface createInstantSearchRouterProps {
  indexName?: string
  serverUrl?: string
  mapRefinements?: (indexUiState) => any
  defaults?: {
    refinementList?: { [index: string]: string[] }
  }
}

function defaultMapRefinements(indexUiState): { languageEnglishName: string } {
  return {
    languageEnglishName: indexUiState.refinementList?.languageEnglishName
  }
}

export function createInstantSearchRouter({
  indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? '',
  serverUrl = process.env.NEXT_PUBLIC_WATCH_URL ?? '',
  mapRefinements = defaultMapRefinements,
  defaults = {}
}: createInstantSearchRouterProps = {}): RouterProps {
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
          refinementList: mapRefinements(indexUiState)
        } as unknown as UiState

        return stateRoute
      },
      routeToState(routeState) {
        const indexRouteState = routeState[indexName] || {}

        return {
          [indexName]: {
            ...indexRouteState,
            refinementList: {
              ...(defaults.refinementList || {}),
              ...(indexRouteState.refinementList || {})
            }
          }
        }
      }
    }
  }
}
