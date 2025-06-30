import { gql } from '@apollo/client'

export const CARD_FIELDS = gql`
  fragment CardFields on CardBlock {
    id
    parentBlockId
    parentOrder
    backgroundColor
    backdropBlur
    coverBlockId
    themeMode
    themeName
    fullscreen
  }
`
