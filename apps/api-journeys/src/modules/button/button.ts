import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  enum ButtonVariant {
    text
    contained
  }

  enum ButtonColor {
    primary
    secondary
    error
    inherit
  }

  enum ButtonSize {
    small
    medium
    large
  }

  type ButtonBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    fullWidth: Boolean
    variant: ButtonVariant
    color: ButtonColor
    size: ButtonSize
    startIcon: Icon
    endIcon: Icon
    action: Action
  }
`

export const buttonModule = createModule({
  id: 'button',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
