import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  JourneyDuplicate,
  JourneyDuplicateVariables
} from '../../../__generated__/JourneyDuplicate'

export const JOURNEY_DUPLICATE = gql`
  mutation JourneyDuplicate($id: ID!, $teamId: ID!) {
    journeyDuplicate(id: $id, teamId: $teamId) {
      id
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
              adminJourneys(existingAdminJourneyRefs = []) {
                const duplicatedJourneyRef = cache.writeFragment({
                  data: data.journeyDuplicate,
                  fragment: gql`
                    fragment DuplicatedJourney on Journey {
                      id
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
