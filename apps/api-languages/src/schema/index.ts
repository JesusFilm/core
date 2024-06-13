import { writeFileSync } from 'fs'

import { printSubgraphSchema } from '@apollo/subgraph'
import { lexicographicSortSchema } from 'graphql'

import './language'
import './country'
import { builder } from './builder'

export const schema = builder.toSubGraphSchema({})

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const schemaAsString = printSubgraphSchema(lexicographicSortSchema(schema))

writeFileSync('apps/api-languages/schema.graphql', schemaAsString)
