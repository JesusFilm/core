import { gql, useLazyQuery } from '@apollo/client'
import { ReactElement, ReactNode, useEffect } from 'react'

import { convertLanguagesToOptions } from '@core/shared/ui/LanguageAutocomplete/utils/convertLanguagesToOptions'

import { useJourney } from '../../../libs/JourneyProvider'

interface TeamLanguageWrapperProps {
  children: (journeyLanguage?: JourneyLanguage) => ReactNode
  journeyId?: string
}

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

const GET_JOURNEY_LANGUAGE = gql`
  query GetJourneyLanguage($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      language {
        id
        bcp47
        iso3
        name {
          value
          primary
        }
      }
    }
  }
`

export function TeamLanguageWrapper({
  children,
  journeyId
}: TeamLanguageWrapperProps): ReactElement {
  const { journey } = useJourney()

  const [getJourneyLanguage, { data }] = useLazyQuery(GET_JOURNEY_LANGUAGE, {
    variables: { id: journeyId }
  })

  useEffect(() => {
    if (journeyId) {
      void getJourneyLanguage({ variables: { id: journeyId } })
    }
  }, [getJourneyLanguage, journeyId, journey])

  const journeyLanguage = journey?.language ?? data?.journey?.language
  const languageOption = convertLanguagesToOptions([journeyLanguage])[0]

  return <>{children(languageOption)}</>
}
