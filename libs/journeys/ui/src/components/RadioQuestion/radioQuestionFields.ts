import { FragmentOf, graphql } from '@core/shared/gql'

export const RADIO_QUESTION_FIELDS = graphql(`
  fragment RadioQuestionFields on RadioQuestionBlock {
    id
    parentBlockId
    parentOrder
    gridView
  }
`)

export type RadioQuestionFields = FragmentOf<typeof RADIO_QUESTION_FIELDS>
