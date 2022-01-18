import { gql } from '@apollo/client'

export const STEP_FIELDS = gql`
  fragment StepFields on StepBlock {
    id
    journeyId
    parentBlockId
    locked
    nextBlockId
  }
`
