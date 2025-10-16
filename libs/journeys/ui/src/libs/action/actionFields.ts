import { FragmentOf, graphql } from '@core/shared/gql'

export const ACTION_FIELDS = graphql(`
  fragment ActionFields on Action {
    parentBlockId
    gtmEventName
    ... on NavigateToBlockAction {
      blockId
    }
    ... on LinkAction {
      url
      customizable
      parentStepId
    }
    ... on EmailAction {
      email
      customizable
      parentStepId
    }
    ... on PhoneAction {
      phone
      countryCode
      contactAction
    }
  }
`)

export type ActionFields = FragmentOf<typeof ACTION_FIELDS>
