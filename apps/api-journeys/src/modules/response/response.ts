import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  interface Response {
    id: ID!
    userId: ID!
  }
`

export const responseModule = createModule({
  id: 'response',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
