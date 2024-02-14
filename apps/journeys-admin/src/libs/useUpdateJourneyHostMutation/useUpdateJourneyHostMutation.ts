import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

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
  options?: MutationHookOptions<UpdateJourneyHost, UpdateJourneyHostVariables>
): MutationTuple<UpdateJourneyHost, UpdateJourneyHostVariables> {
  const mutation = useMutation<UpdateJourneyHost>(UPDATE_JOURNEY_HOST, options)

  return mutation
}
