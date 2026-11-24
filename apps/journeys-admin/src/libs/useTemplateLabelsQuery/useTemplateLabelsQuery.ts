import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  TemplateLabels,
  TemplateLabelsVariables,
  TemplateLabels_adminJourney
} from '../../../__generated__/TemplateLabels'

export const TEMPLATE_LABELS = gql`
  query TemplateLabels($id: ID!) {
    adminJourney(id: $id, idType: databaseId) {
      id
      custom1Label
      custom2Label
      custom3Label
    }
  }
`

export function useTemplateLabelsQuery(
  id?: string
): useQuery.Result<
  TemplateLabels,
  TemplateLabelsVariables,
  'empty' | 'complete' | 'streaming'
> {
  return useQuery<TemplateLabels, TemplateLabelsVariables>(TEMPLATE_LABELS, {
    variables: { id: id ?? '' },
    skip: id == null
  })
}

export function useJourneyCustomTrackingLabels():
  | TemplateLabels_adminJourney
  | undefined {
  const { journey } = useJourney()
  const { data } = useTemplateLabelsQuery(
    journey?.template === true ? journey.id : undefined
  )
  return journey?.template === true &&
    data?.adminJourney != null &&
    data.adminJourney.id === journey.id
    ? data.adminJourney
    : undefined
}
