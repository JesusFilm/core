import { gql, QueryHookOptions, QueryResult, useQuery } from '@apollo/client'
import {
  GetParentJourneysFromTemplateIdVariables,
  GetParentJourneysFromTemplateId,
  GetParentJourneysFromTemplateId_journeys_language as Language
} from '../../../__generated__/GetParentJourneysFromTemplateId'
import { useMemo } from 'react'

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
  options?: QueryHookOptions<
    GetParentJourneysFromTemplateId,
    GetParentJourneysFromTemplateIdVariables
  >
): QueryResult<
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
