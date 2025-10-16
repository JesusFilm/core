import { MutationHookOptions, MutationTuple, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

export type JourneyDuplicate = ResultOf<typeof JOURNEY_DUPLICATE>
export type JourneyDuplicateVariables = VariablesOf<typeof JOURNEY_DUPLICATE>

export const JOURNEY_DUPLICATE = graphql(`
  mutation JourneyDuplicate($id: ID!, $teamId: ID!) {
    journeyDuplicate(id: $id, teamId: $teamId) {
      id
    }
  }
`)

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
                  fragment: graphql(`
                    fragment DuplicatedJourney on Journey {
                      id
                    }
                  `)
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
