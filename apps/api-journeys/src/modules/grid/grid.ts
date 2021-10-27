import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  enum GridDirection {
    columnReverse
    column
    row
    rowReverse
  }

  enum GridJustifyContent {
    flexStart
    flexEnd
    center
  }

  enum GridAlignItems {
    baseline
    flexStart
    flexEnd
    center
  }

  type Item {
    xl: Int!
    lg: Int!
    sm: Int!
  }

  type Container {
    spacing: Int!
    direction: GridDirection!
    justifyContent: GridJustifyContent!
    alignItems: GridAlignItems!
  }

  type GridBlock implements Block {
    id: ID!
    parentBlockId: ID
    item: Item
    container: Container
  }
`

export const gridModule = createModule({
  id: 'grid',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
