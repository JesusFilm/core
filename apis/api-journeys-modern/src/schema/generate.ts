import { readFileSync, writeFileSync } from 'node:fs'

import { printSubgraphSchema } from '@apollo/subgraph'
import { lexicographicSortSchema } from 'graphql'

import { logger } from './logger'

import { schema } from '.'

const filename = 'apis/api-journeys-modern/schema.graphql'
export function generate(): void {
  const schemaAsString = printSubgraphSchema(lexicographicSortSchema(schema))
  const currentSchemaAsString = readFileSync(filename, 'utf-8')
  if (schemaAsString !== currentSchemaAsString) {
    writeFileSync(filename, schemaAsString)
    logger.info({ filename }, 'schema generated')
  }
}
