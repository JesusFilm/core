import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  enum GridType {
    container
    item
    containerItem
  }

  enum ColumnSize {
   _1
   _2
   _3
   _4
   _5
   _6
   _7
   _8
   _9
   _10
   _11
   _12
  }

  type GridBlock implements Block {
    id: ID!
    parentBlockId: ID
    md: ColumnSize
    type: GridType
  }
`;

export const gridModule = createModule({
  id: 'grid',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
