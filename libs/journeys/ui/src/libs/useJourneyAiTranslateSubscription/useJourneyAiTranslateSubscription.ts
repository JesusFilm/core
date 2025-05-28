import {
  SubscriptionHookOptions,
  gql,
  useApolloClient,
  useSubscription
} from '@apollo/client'

import {
  JourneyAiTranslateCreate,
  JourneyAiTranslateCreateVariables
} from './__generated__/JourneyAiTranslateCreate'

export const JOURNEY_AI_TRANSLATE_CREATE = gql`
  subscription JourneyAiTranslateCreate(
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
    }
  }
`

// Helper function to update the cache with translated journey data
export function updateCacheWithTranslatedJourney(
  client: ReturnType<typeof useApolloClient>,
  translatedJourney: JourneyAiTranslateCreate['journeyAiTranslateCreate']['journey']
) {
  if (!translatedJourney) return

  try {
    // Update the journey in the cache
    client.cache.writeFragment({
      id: client.cache.identify({
        __typename: 'Journey',
        id: translatedJourney.id
      }),
      fragment: gql`
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
      `,
      data: {
        id: translatedJourney.id,
        title: translatedJourney.title,
        description: translatedJourney.description,
        languageId: translatedJourney.languageId,
        updatedAt: translatedJourney.updatedAt,
        blocks: translatedJourney.blocks,
        __typename: 'Journey'
      }
    })

    // Also update individual blocks in the cache
    translatedJourney.blocks?.forEach((block) => {
      client.cache.writeFragment({
        id: client.cache.identify({
          __typename: block.__typename,
          id: block.id
        }),
        fragment: gql`
          fragment TranslatedBlock on Block {
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
        `,
        data: block
      })
    })

    // Broadcast cache changes to trigger UI updates
    client.cache.broadcastWatches()
  } catch (error) {
    console.error('Error updating cache with translated journey:', error)
  }
}

export function useJourneyAiTranslateSubscription(
  options?: SubscriptionHookOptions<
    JourneyAiTranslateCreate,
    JourneyAiTranslateCreateVariables
  >
) {
  const client = useApolloClient()

  const subscription = useSubscription<
    JourneyAiTranslateCreate,
    JourneyAiTranslateCreateVariables
  >(JOURNEY_AI_TRANSLATE_CREATE, {
    ...options,
    onData: ({ data }) => {
      // Update the Apollo cache with the translated journey (only when complete)
      if (data.data?.journeyAiTranslateCreate?.journey) {
        updateCacheWithTranslatedJourney(
          client,
          data.data.journeyAiTranslateCreate.journey
        )
      }

      // Always trigger the existing onData callback for progress updates
      options?.onData?.(data)
    }
  })

  return subscription
}
