import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  JourneyImageBlockAssociationUpdate,
  JourneyImageBlockAssociationUpdateVariables
} from '../../../__generated__/JourneyImageBlockAssociationUpdate'

export const JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE = gql`
  mutation JourneyImageBlockAssociationUpdate(
    $id: ID!
    $input: JourneyUpdateInput!
  ) {
    journeyUpdate(id: $id, input: $input) {
      id
      primaryImageBlock {
        id
      }
      creatorImageBlock {
        id
      }
    }
  }
`

export function useJourneyImageBlockAssociationUpdateMutation(
  options?: useMutation.Options<
    JourneyImageBlockAssociationUpdate,
    JourneyImageBlockAssociationUpdateVariables
  >
): useMutation.ResultTuple<
  JourneyImageBlockAssociationUpdate,
  JourneyImageBlockAssociationUpdateVariables
> {
  const mutation = useMutation<
    JourneyImageBlockAssociationUpdate,
    JourneyImageBlockAssociationUpdateVariables
  >(JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE, options)

  return mutation
}
