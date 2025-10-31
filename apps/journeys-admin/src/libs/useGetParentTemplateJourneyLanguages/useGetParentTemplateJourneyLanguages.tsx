import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

import {
  GetParentJourneysFromTemplateId,
  GetParentJourneysFromTemplateIdVariables,
  GetParentJourneysFromTemplateId_journeys_language as Language
} from '../../../__generated__/GetParentJourneysFromTemplateId'

export const GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID = gql`
  query GetParentJourneysFromTemplateId($where: JourneysFilter) {
    journeys(where: $where) {
      id
      fromTemplateId
      language {
        id
        slug
        name {
          primary
          value
        }
      }
    }
  }
`

export function useGetParentTemplateJourneyLanguages(
  options?: useQuery.Options<
    GetParentJourneysFromTemplateId,
    GetParentJourneysFromTemplateIdVariables
  >
): useQuery.Result<
  GetParentJourneysFromTemplateId,
  GetParentJourneysFromTemplateIdVariables
> & {
  languages: Language[]
  languagesJourneyMap: Record<string, string> | undefined
} {
  const query = useQuery<
    GetParentJourneysFromTemplateId,
    GetParentJourneysFromTemplateIdVariables
  >(GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID, options)

  const languages = useMemo(() => {
    return [...(query.data?.journeys.map((journey) => journey.language) ?? [])]
  }, [query])

  const languagesJourneyMap = useMemo(() => {
    return query.data?.journeys.reduce(
      (acc, journey) => {
        acc[journey.language.id] = journey.id
        return acc
      },
      {} as Record<string, string>
    )
  }, [query])

  return {
    ...query,
    languages,
    languagesJourneyMap
  }
}
