import { gql } from '@apollo/client'

export const RADIO_QUESTION_FIELDS = gql`
  fragment RadioQuestionFields on RadioQuestionBlock {
    id
    parentBlockId
    parentOrder
    gridView
  }
`
