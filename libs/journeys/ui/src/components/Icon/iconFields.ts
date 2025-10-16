import { FragmentOf, graphql } from '@core/shared/gql'

export const ICON_FIELDS = graphql(`
  fragment IconFields on IconBlock {
    id
    parentBlockId
    parentOrder
    iconName: name
    iconSize: size
    iconColor: color
  }
`)

export type IconFields = FragmentOf<typeof ICON_FIELDS>
