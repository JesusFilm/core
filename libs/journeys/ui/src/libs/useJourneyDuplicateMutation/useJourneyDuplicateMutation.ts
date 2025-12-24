import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  JourneyDuplicate,
  JourneyDuplicateVariables
} from './__generated__/JourneyDuplicate'

export const JOURNEY_DUPLICATE = gql`
  mutation JourneyDuplicate(
    $id: ID!
    $teamId: ID!
    $forceNonTemplate: Boolean
  ) {
    journeyDuplicate(
      id: $id
      teamId: $teamId
      forceNonTemplate: $forceNonTemplate
    ) {
      id
      template
    }
  }
`

export function useJourneyDuplicateMutation(
  options?: useMutation.Options<JourneyDuplicate, JourneyDuplicateVariables>
): useMutation.ResultTuple<JourneyDuplicate, JourneyDuplicateVariables> {
  const mutation = useMutation<JourneyDuplicate, JourneyDuplicateVariables>(
    JOURNEY_DUPLICATE,
    {
      update(cache, { data }) {
        if (data?.journeyDuplicate != null) {
          cache.modify({
            fields: {
              adminJourneys(existingAdminJourneyRefs = [], details) {
                const args = (details as { args?: { template?: boolean } }).args
                // Only add duplicated journey to journeys cache (template: false)
                // Skip template queries (template: true)
                if (args?.template === true) {
                  return existingAdminJourneyRefs
                }
                const duplicatedJourneyRef = cache.writeFragment({
                  data: data.journeyDuplicate,
                  fragment: gql`
                    fragment DuplicatedJourney on Journey {
                      id
                      template
                    }
                  `
                })
                return [...existingAdminJourneyRefs, duplicatedJourneyRef]
              }
            }
          })
        }
      },
      ...options
    }
  )

  return mutation
}
