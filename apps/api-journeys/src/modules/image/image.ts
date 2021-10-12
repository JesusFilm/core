import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  type ImageBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    width: Int!
    height: Int!
    alt: String!
  }
`

export const imageModule = createModule({
  id: 'image',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
