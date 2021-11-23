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

  type GridContainerBlock implements Block {
    id: ID!
    parentBlockId: ID
    spacing: Int!
    direction: GridDirection!
    justifyContent: GridJustifyContent!
    alignItems: GridAlignItems!
  }
`

export const gridContainerModule = createModule({
  id: 'gridContainer',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
