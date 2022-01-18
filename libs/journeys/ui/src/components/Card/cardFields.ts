import { gql } from '@apollo/client'

export const CARD_FIELDS = gql`
  fragment CardFields on CardBlock {
    id
    journeyId
    parentBlockId
    backgroundColor
    coverBlockId
    themeMode
    themeName
    fullscreen
  }
`
