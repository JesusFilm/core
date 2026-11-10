import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'

import {
  JourneySettingsUpdate,
  JourneySettingsUpdateVariables
} from '../../../__generated__/JourneySettingsUpdate'

const JOURNEY_SETTINGS_FIELDS = gql`
  ${BLOCK_FIELDS}
  fragment JourneySettingsFields on Journey {
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
`

export const JOURNEY_SETTINGS_UPDATE = gql`
  ${JOURNEY_SETTINGS_FIELDS}
  mutation JourneySettingsUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      ...JourneySettingsFields
    }
  }
`

export const JOURNEY_SETTINGS_WITH_LABELS_UPDATE = gql`
  ${JOURNEY_SETTINGS_FIELDS}
  mutation JourneySettingsWithLabelsUpdate(
    $id: ID!
    $input: JourneyUpdateInput!
  ) {
    journeyUpdate(id: $id, input: $input) {
      ...JourneySettingsFields
      custom1Label
      custom2Label
      custom3Label
    }
  }
`

interface JourneyUpdateMutationOptions
  extends useMutation.Options<
    JourneySettingsUpdate,
    JourneySettingsUpdateVariables
  > {
  includeCustomLabels?: boolean
}

export function useJourneyUpdateMutation({
  includeCustomLabels = false,
  ...options
}: JourneyUpdateMutationOptions = {}): useMutation.ResultTuple<
  JourneySettingsUpdate,
  JourneySettingsUpdateVariables
> {
  const mutation = useMutation<
    JourneySettingsUpdate,
    JourneySettingsUpdateVariables
  >(
    includeCustomLabels
      ? JOURNEY_SETTINGS_WITH_LABELS_UPDATE
      : JOURNEY_SETTINGS_UPDATE,
    options
  )

  return mutation
}
