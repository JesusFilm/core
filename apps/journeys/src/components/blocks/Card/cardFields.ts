import { gql } from '@apollo/client'

export const CARD_FIELDS = gql`
  fragment CardFields on CardBlock {
    id
    parentBlockId
    backgroundColor
    coverBlockId
    themeMode
    themeName
  }
`
