import { writeFileSync } from 'fs'

import { printSubgraphSchema } from '@apollo/subgraph'
import { lexicographicSortSchema } from 'graphql'

import './objects/error'
import './site'
import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.3'
})

if (process.env.NODE_ENV !== 'production') {
  const schemaAsString = printSubgraphSchema(lexicographicSortSchema(schema))

  writeFileSync('apps/api-analytics/schema.graphql', schemaAsString)
}
