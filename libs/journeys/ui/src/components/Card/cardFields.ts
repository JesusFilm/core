import { FragmentOf, graphql } from '@core/shared/gql'

export const CARD_FIELDS = graphql(`
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
`)

export type CardFields = FragmentOf<typeof CARD_FIELDS>
