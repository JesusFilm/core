import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  UpdateJourneyHost,
  UpdateJourneyHostVariables
} from '../../../__generated__/UpdateJourneyHost'

export const UPDATE_JOURNEY_HOST = gql`
  mutation UpdateJourneyHost($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      host {
        id
      }
    }
  }
`

export function useUpdateJourneyHostMutation(
  options?: useMutation.Options<UpdateJourneyHost, UpdateJourneyHostVariables>
): useMutation.ResultTuple<UpdateJourneyHost, UpdateJourneyHostVariables> {
  const mutation = useMutation<UpdateJourneyHost>(UPDATE_JOURNEY_HOST, options)

  return mutation
}
