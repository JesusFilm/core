import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  type GridItemBlock implements Block {
    id: ID!
    parentBlockId: ID
    xl: Int!
    lg: Int!
    sm: Int!  
  }
`

export const gridItemModule = createModule({
  id: 'gridItem',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
