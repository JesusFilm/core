import {
  SubscriptionHookOptions,
  useApolloClient,
  useSubscription
} from '@apollo/client'

import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

export type JourneyAiTranslateCreateSubscription = ResultOf<
  typeof JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION
>
export type JourneyAiTranslateCreateSubscriptionVariables = VariablesOf<
  typeof JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION
>

export const JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION = graphql(`
  subscription JourneyAiTranslateCreateSubscription(
    $journeyId: ID!
    $name: String!
    $journeyLanguageName: String!
    $textLanguageId: ID!
    $textLanguageName: String!
  ) {
    journeyAiTranslateCreateSubscription(
      input: {
        journeyId: $journeyId
        name: $name
        journeyLanguageName: $journeyLanguageName
        textLanguageId: $textLanguageId
        textLanguageName: $textLanguageName
      }
    ) {
      progress
      message
      journey {
        id
        title
        description
        languageId
        createdAt
        updatedAt
        blocks {
          id
          ... on TypographyBlock {
            content
          }
          ... on ButtonBlock {
            label
          }
          ... on RadioOptionBlock {
            label
          }
          ... on TextResponseBlock {
            label
            placeholder
          }
        }
      }
    }
  }
`)

// Helper function to update the cache with translated journey data
export function updateCacheWithTranslatedJourney(
  client: ReturnType<typeof useApolloClient>,
  translatedJourney: JourneyAiTranslateCreateSubscription['journeyAiTranslateCreateSubscription']['journey']
) {
  if (!translatedJourney) return

  try {
    // Update the journey in the cache
    client.cache.writeFragment({
      id: client.cache.identify({
        __typename: 'Journey',
        id: translatedJourney.id
      }),
      fragment: graphql(`
        fragment TranslatedJourney on Journey {
          id
          title
          description
          languageId
          updatedAt
          blocks {
            id
            __typename
            ... on TypographyBlock {
              content
            }
            ... on ButtonBlock {
              label
            }
            ... on RadioOptionBlock {
              label
            }
            ... on TextResponseBlock {
              label
              placeholder
            }
          }
        }
      `),
      data: {
        id: translatedJourney.id,
        title: translatedJourney.title,
        description: translatedJourney.description,
        languageId: translatedJourney.languageId,
        updatedAt: translatedJourney.updatedAt,
        blocks: translatedJourney.blocks
      }
    })

    // Broadcast cache changes to trigger UI updates
    // Note: broadcastWatches is not available in newer Apollo versions
    // The cache updates will automatically trigger re-renders
  } catch (error) {
    console.error('Error updating cache with translated journey:', error)
  }
}

export function useJourneyAiTranslateSubscription(
  options?: SubscriptionHookOptions<
    JourneyAiTranslateCreateSubscription,
    JourneyAiTranslateCreateSubscriptionVariables
  >
) {
  const client = useApolloClient()

  const subscription = useSubscription<
    JourneyAiTranslateCreateSubscription,
    JourneyAiTranslateCreateSubscriptionVariables
  >(JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION, {
    ...options,
    onData: (result) => {
      // Update the Apollo cache with the translated journey (only when complete)
      if (result.data.data?.journeyAiTranslateCreateSubscription?.journey) {
        updateCacheWithTranslatedJourney(
          client,
          result.data.data.journeyAiTranslateCreateSubscription.journey
        )
      }

      // Always trigger the existing onData callback for progress updates
      options?.onData?.(result)
    }
  })

  return subscription
}
