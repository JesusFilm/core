import { gql } from '@apollo/client'
import { CARD_FIELDS } from '@core/journeys/ui'

export const CARD_BLOCK_UPDATE = gql`
  ${CARD_FIELDS}
  mutation CardBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      ...CardFields
    }
  }
`
