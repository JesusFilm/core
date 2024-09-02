import { writeFileSync } from 'node:fs'

import { printSubgraphSchema } from '@apollo/subgraph'
import { lexicographicSortSchema } from 'graphql'

import { logger } from './logger'

import { schema } from '.'

const filename = 'apps/api-tags/schema.graphql'
export function generate(): void {
  const schemaAsString = printSubgraphSchema(lexicographicSortSchema(schema))
  writeFileSync(filename, schemaAsString)
  logger.info({ filename }, 'schema generated')
}
