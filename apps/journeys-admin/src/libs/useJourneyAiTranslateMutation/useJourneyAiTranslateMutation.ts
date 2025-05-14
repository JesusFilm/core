import { gql, useMutation } from '@apollo/client'

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
    $forceTranslate: Boolean
  ) {
    journeyAiTranslateCreate(
      input: {
        journeyId: $journeyId
        name: $name
        journeyLanguageName: $journeyLanguageName
        textLanguageId: $textLanguageId
        textLanguageName: $textLanguageName
        forceTranslate: $forceTranslate
      }
    )
  }
`

/**
 * Hook for translating a journey using AI
 *
 * @returns An object containing:
 * - translateJourney: Function to translate a journey
 * - loading: Boolean indicating if the mutation is in progress
 */
export function useJourneyAiTranslateMutation(): {
  translateJourney: (
    variables: JourneyAiTranslateCreateVariables
  ) => Promise<string | undefined>
  loading: boolean
} {
  const [mutate, { loading }] = useMutation<
    JourneyAiTranslateCreate,
    JourneyAiTranslateCreateVariables
  >(JOURNEY_AI_TRANSLATE_CREATE)

  /**
   * Translates a journey using AI
   *
   * @param variables - The variables needed for translation
   * @returns A promise that resolves to the job ID if successful, undefined otherwise
   */
  const translateJourney = async (
    variables: JourneyAiTranslateCreateVariables
  ): Promise<string | undefined> => {
    try {
      // TODO: Add cache update logic to add the translated journey to adminJourneys
      // when the backend starts returning the created journey ID
      const { data } = await mutate({ variables })
      return data?.journeyAiTranslateCreate
    } catch (error) {
      console.error('Error translating journey:', error)
      throw error
    }
  }

  return {
    translateJourney,
    loading
  }
}
