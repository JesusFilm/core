import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  enum GridSpacing {
    _1
    _2
    _3
    _4
    _5
    _6
  }

  enum GridSize {
    auto
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

  enum GridDirection {
    column_reverse
    column
    row
    row_reverse
  }

  enum GridJustifyContent {
    flex_start
    flex_end
    center
  }

  enum GridAlignItems {
    baseline
    flex_start
    flex_end
    center
  }

  type Item {
    lg: GridSize!
  }

  type Container {
    spacing: GridSpacing!
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
`;

export const gridModule = createModule({
  id: 'grid',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
