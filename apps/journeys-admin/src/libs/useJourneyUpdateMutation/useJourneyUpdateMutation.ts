import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  JourneySettingsUpdate,
  JourneySettingsUpdateVariables
} from '../../../__generated__/JourneySettingsUpdate'

export const JOURNEY_SETTINGS_UPDATE = gql`
  mutation JourneySettingsUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      title
      description
      strategySlug
      language {
        id
      }
      tags {
        id
      }
    }
  }
`
export function useJourneyUpdateMutation(
  options?: MutationHookOptions<
    JourneySettingsUpdate,
    JourneySettingsUpdateVariables
  >
): MutationTuple<JourneySettingsUpdate, JourneySettingsUpdateVariables> {
  const mutation = useMutation<
    JourneySettingsUpdate,
    JourneySettingsUpdateVariables
  >(JOURNEY_SETTINGS_UPDATE, options)

  return mutation
}
