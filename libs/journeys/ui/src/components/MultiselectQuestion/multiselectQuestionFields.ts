import { gql } from '@apollo/client'

export const MULTISELECT_QUESTION_FIELDS = gql`
  fragment MultiselectQuestionFields on MultiselectBlock {
    id
    parentBlockId
    parentOrder
    min
    max
  }
`
