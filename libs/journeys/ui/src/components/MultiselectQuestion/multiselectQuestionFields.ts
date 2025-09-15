import { gql } from '@apollo/client'

export const MULTISELECT_QUESTION_FIELDS = gql`
  fragment MultiselectQuestionFields on MultiselectQuestionBlock {
    id
    parentBlockId
    parentOrder
    gridView
  }
`
