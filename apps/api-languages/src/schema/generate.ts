import { writeFileSync } from 'node:fs'

import { printSubgraphSchema } from '@apollo/subgraph'
import chalk from 'chalk'
import { lexicographicSortSchema } from 'graphql'

import { schema } from '.'

export function generate(): void {
  const schemaAsString = printSubgraphSchema(lexicographicSortSchema(schema))
  writeFileSync('apps/api-languages/schema.graphql', schemaAsString)

  console.log(
    '✔ Schema Generated',
    chalk.bold('GraphQL Schema'),
    chalk.grey('to apps/api-languages/schema.graphql')
  )
}
