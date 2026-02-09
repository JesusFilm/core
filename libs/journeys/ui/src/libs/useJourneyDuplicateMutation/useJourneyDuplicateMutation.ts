import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  JourneyDuplicate,
  JourneyDuplicateVariables
} from './__generated__/JourneyDuplicate'

export const JOURNEY_DUPLICATE = gql`
  mutation JourneyDuplicate(
    $id: ID!
    $teamId: ID!
    $forceNonTemplate: Boolean
  ) # $duplicateAsDraft: Boolean
  {
    journeyDuplicate(
      id: $id
      teamId: $teamId
      forceNonTemplate: $forceNonTemplate
    ) # duplicateAsDraft: $duplicateAsDraft
    {
      id
      template
    }
  }
`

export function useJourneyDuplicateMutation(
  options?: MutationHookOptions<JourneyDuplicate, JourneyDuplicateVariables>
): MutationTuple<JourneyDuplicate, JourneyDuplicateVariables> {
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
