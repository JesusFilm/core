import { createModule, gql } from 'graphql-modules'
import { GraphQLScalarType } from 'graphql'

const typeDefs = gql`
  scalar DateTime
`

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 8601 Date Time Scalar type',
  // Convert Date from backend to ISOString for frontend
  serialize(value: Date) {
    return value.toISOString()
  }
})

const resolvers = {
  DateTime: dateTimeScalar
}

export const dateTimeModule = createModule({
  id: 'dateTime',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
