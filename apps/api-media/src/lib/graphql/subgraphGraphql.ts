import { initGraphQLTada } from 'gql.tada'

import type { introspection } from '../../__generated__/graphql-subgraph-env.d.ts'

export const graphql = initGraphQLTada<{
  introspection: introspection
}>()
