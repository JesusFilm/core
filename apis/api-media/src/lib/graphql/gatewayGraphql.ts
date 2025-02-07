import { initGraphQLTada } from 'gql.tada'

import type { introspection } from '../../__generated__/graphql-gateway-env.js'

export const graphql = initGraphQLTada<{
  introspection: introspection
}>()
