import { initGraphQLTada } from 'gql.tada'

// import type { introspection } from '../../__generated__/graphql-subgraph-env.js'

export const graphql = initGraphQLTada<{
  introspection: any
}>()
