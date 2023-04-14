import { gql, useMutation } from '@apollo/client'

import {
  DuplicateJourney,
  DuplicateJourney_journeyDuplicate as Journey
} from '../../../__generated__/DuplicateJourney'

export const DUPLICATE_JOURNEY = gql`
  mutation DuplicateJourney($id: ID!) {
    journeyDuplicate(id: $id) {
      id
    }
  }
`

interface duplicateJourneyProps {
  id: string
}

export function useJourneyDuplicate(): {
  duplicateJourney: ({
    id
  }: duplicateJourneyProps) => Promise<Journey | undefined>
} {
  const [duplicateJourney] = useMutation<DuplicateJourney>(DUPLICATE_JOURNEY)

  return {
    duplicateJourney: async ({
      id
    }: duplicateJourneyProps): Promise<Journey | undefined> => {
      try {
        const { data } = await duplicateJourney({
          variables: { id },
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
          }
        })
        return data?.journeyDuplicate
      } catch (e) {
        return undefined
      }
    }
  }
}
