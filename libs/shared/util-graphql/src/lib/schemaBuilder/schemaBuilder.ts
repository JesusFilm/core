/* eslint-disable  @typescript-eslint/no-explicit-any */

import { DocumentNode, GraphQLSchema } from 'graphql'
import { GraphQLSchemaModule } from 'apollo-graphql'
import { buildSubgraphSchema } from '@apollo/federation'

export function schemaBuilder (
  input: {
    typeDefs: DocumentNode[]
    resolvers: Array<Record<string, any>>
  }
): GraphQLSchema {
  const { typeDefs, resolvers } = input

  if (typeDefs.length !== resolvers.length) {
    throw new Error(`Number of typeDefs: ${typeDefs.length} does not match number of resolvers: ${resolvers.length}`)
  }

  const modules = typeDefs.map((typeDefs, i) => {
    const module: GraphQLSchemaModule = { typeDefs: typeDefs, resolvers: resolvers[i] }
    return module
  })

  return buildSubgraphSchema(modules)
}
