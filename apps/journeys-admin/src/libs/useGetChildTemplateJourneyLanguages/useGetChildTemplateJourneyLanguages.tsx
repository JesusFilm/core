import { gql } from '@apollo/client';
import { useQuery } from "@apollo/client/react";
import { useMemo } from 'react'

import {
  GetChildJourneysFromTemplateId,
  GetChildJourneysFromTemplateIdVariables,
  GetChildJourneysFromTemplateId_journeys_language as Language
} from '../../../__generated__/GetChildJourneysFromTemplateId'

export const GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID = gql`
  query GetChildJourneysFromTemplateId($where: JourneysFilter) {
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

export function useGetChildTemplateJourneyLanguages(
  options?: useQuery.Options<
    GetChildJourneysFromTemplateId,
    GetChildJourneysFromTemplateIdVariables
  >
): useQuery.Result<
  GetChildJourneysFromTemplateId,
  GetChildJourneysFromTemplateIdVariables
> & {
  languages: Language[]
  languagesJourneyMap: Record<string, string> | undefined
} {
  const query = useQuery<
    GetChildJourneysFromTemplateId,
    GetChildJourneysFromTemplateIdVariables
  >(GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID, options)

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
