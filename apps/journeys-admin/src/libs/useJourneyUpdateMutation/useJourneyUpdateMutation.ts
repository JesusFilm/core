import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'

import {
  JourneySettingsUpdate,
  JourneySettingsUpdateVariables
} from '../../../__generated__/JourneySettingsUpdate'

export const JOURNEY_SETTINGS_UPDATE = gql`
  ${BLOCK_FIELDS}
  mutation JourneySettingsUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      title
      description
      strategySlug
      language {
        id
        bcp47
        iso3
        name {
          value
          primary
        }
      }
      tags {
        id
      }
      website
      showShareButton
      showLikeButton
      showDislikeButton
      displayTitle
      menuButtonIcon
      menuStepBlock {
        ...BlockFields
      }
      socialNodeX
      socialNodeY
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
