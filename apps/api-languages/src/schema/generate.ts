import { writeFileSync } from 'node:fs'

import { printSubgraphSchema } from '@apollo/subgraph'
import chalk from 'chalk'
import { lexicographicSortSchema } from 'graphql'

import { schema } from '.'

const filename = 'apps/api-languages/schema.graphql'
export function generate(): void {
  const schemaAsString = printSubgraphSchema(lexicographicSortSchema(schema))
  writeFileSync(filename, schemaAsString)

  console.log(
    '✔ Schema Generated',
    chalk.bold('GraphQL Schema'),
    chalk.grey(`to ${filename}`)
  )
}
