import { MutationHookOptions, gql, useMutation } from '@apollo/client'

import {
  JourneyAiTranslateCreate,
  JourneyAiTranslateCreateVariables
} from '../../../__generated__/JourneyAiTranslateCreate'

export const JOURNEY_AI_TRANSLATE_CREATE = gql`
  mutation JourneyAiTranslateCreate(
    $journeyId: ID!
    $name: String!
    $journeyLanguageName: String!
    $textLanguageId: ID!
    $textLanguageName: String!
  ) {
    journeyAiTranslateCreate(
      input: {
        journeyId: $journeyId
        name: $name
        journeyLanguageName: $journeyLanguageName
        textLanguageId: $textLanguageId
        textLanguageName: $textLanguageName
      }
    ) {
      id
      title
      description
      languageId
      createdAt
      updatedAt
    }
  }
`

export function useJourneyAiTranslateMutation(
  options?: MutationHookOptions<
    JourneyAiTranslateCreate,
    JourneyAiTranslateCreateVariables
  >
) {
  const mutation = useMutation<
    JourneyAiTranslateCreate,
    JourneyAiTranslateCreateVariables
  >(JOURNEY_AI_TRANSLATE_CREATE, {
    update(cache, { data }) {
      if (data?.journeyAiTranslateCreate != null) {
        cache.modify({
          fields: {
            adminJourneys(existingAdminJourneyRefs = []) {
              const translatedJourneyRef = cache.writeFragment({
                data: data.journeyAiTranslateCreate,
                fragment: gql`
                  fragment TranslatedJourney on Journey {
                    id
                    title
                    description
                    languageId
                    createdAt
                    updatedAt
                  }
                `
              })
              return [...existingAdminJourneyRefs, translatedJourneyRef]
            }
          }
        })
      }
    },
    ...options
  })

  return mutation
}
