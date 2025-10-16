import { FragmentOf, graphql } from '@core/shared/gql'

export const STEP_FIELDS = graphql(`
  fragment StepFields on StepBlock {
    id
    parentBlockId
    parentOrder
    locked
    nextBlockId
    slug
  }
`)

export type StepFields = FragmentOf<typeof STEP_FIELDS>
