import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  enum TypographyVariant {
    h1
    h2
    h3
    h4
    h5
    h6
    subtitle1
    subtitle2
    body1
    body2
    caption
    overline
  }

  enum TypographyColor {
    primary
    secondary
    error
  }

  enum TypographyAlign {
    left
    center
    right
  }

  type TypographyBlock implements Block {
    id: ID!
    parentBlockId: ID
    content: String!
    variant: TypographyVariant
    color: TypographyColor
    align: TypographyAlign
  }
`

export const typographyModule = createModule({
  id: 'typography',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
