import { gql } from '@apollo/client';
import { useMutation } from "@apollo/client/react";

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
  options?: useMutation.Options<
    JourneySettingsUpdate,
    JourneySettingsUpdateVariables
  >
): useMutation.ResultTuple<JourneySettingsUpdate, JourneySettingsUpdateVariables> {
  const mutation = useMutation<
    JourneySettingsUpdate,
    JourneySettingsUpdateVariables
  >(JOURNEY_SETTINGS_UPDATE, options)

  return mutation
}
