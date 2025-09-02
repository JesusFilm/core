import { initGraphQLTada } from '@core/shared/gql'

// import type { introspection } from '../../__generated__/graphql-subgraph-env.js'

export const graphql = initGraphQLTada<{
  introspection: any
}>()
