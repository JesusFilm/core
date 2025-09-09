import { gql, QueryResult, useQuery } from '@apollo/client'
import {
  GetJourneysFromTemplateIdVariables,
  GetJourneysFromTemplateId,
  GetJourneysFromTemplateId_journeys_language as Language
} from '../../../__generated__/GetJourneysFromTemplateId'
import { useMemo } from 'react'

export const GET_JOURNEYS_FROM_TEMPLATE_ID = gql`
  query GetJourneysFromTemplateId($where: JourneysFilter) {
    journeys(where: $where) {
      id
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

export function useTemplateJourneyLanguages(
  variables?: GetJourneysFromTemplateIdVariables
): QueryResult<
  GetJourneysFromTemplateId,
  GetJourneysFromTemplateIdVariables
> & {
  languages: Language[]
} {
  const query = useQuery<
    GetJourneysFromTemplateId,
    GetJourneysFromTemplateIdVariables
  >(GET_JOURNEYS_FROM_TEMPLATE_ID, {
    variables
  })

  const languages = useMemo(() => {
    return [...(query.data?.journeys.map((journey) => journey.language) ?? [])]
  }, [query])

  return {
    ...query,
    languages
  }
}
