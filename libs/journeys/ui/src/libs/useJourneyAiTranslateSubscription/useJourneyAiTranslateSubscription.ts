import { gql } from '@apollo/client'
import { useApolloClient, useSubscription } from '@apollo/client/react'
import { useRef } from 'react'

import {
  JourneyAiTranslateCreateSubscription,
  JourneyAiTranslateCreateSubscriptionVariables
} from './__generated__/JourneyAiTranslateCreateSubscription'

export const JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION = gql`
  subscription JourneyAiTranslateCreateSubscription(
    $journeyId: ID!
    $name: String!
    $journeyLanguageName: String!
    $textLanguageId: ID!
    $textLanguageName: String!
    $userLanguageId: ID
    $userLanguageName: String
  ) {
    journeyAiTranslateCreateSubscription(
      input: {
        journeyId: $journeyId
        name: $name
        journeyLanguageName: $journeyLanguageName
        textLanguageId: $textLanguageId
        textLanguageName: $textLanguageName
        userLanguageId: $userLanguageId
        userLanguageName: $userLanguageName
      }
    ) {
      progress
      message
      journey {
        id
        title
        description
        languageId
        language {
          id
          name {
            value
            primary
          }
        }
        createdAt
        updatedAt
        journeyCustomizationDescription
        journeyCustomizationFields {
          id
          journeyId
          key
          value
          defaultValue
        }
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
      fragment: gql`
        fragment TranslatedJourney on Journey {
          id
          title
          description
          languageId
          language {
            id
            name {
              value
              primary
            }
          }
          updatedAt
          journeyCustomizationDescription
          journeyCustomizationFields {
            id
            journeyId
            key
            value
            defaultValue
          }
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
        language: translatedJourney.language,
        updatedAt: translatedJourney.updatedAt,
        journeyCustomizationDescription:
          translatedJourney.journeyCustomizationDescription ?? null,
        journeyCustomizationFields:
          translatedJourney.journeyCustomizationFields ?? [],
        blocks: translatedJourney.blocks,
        __typename: 'Journey'
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
  options: Omit<
    useSubscription.Options<
      JourneyAiTranslateCreateSubscription,
      JourneyAiTranslateCreateSubscriptionVariables
    >,
    'variables'
  > & { variables?: JourneyAiTranslateCreateSubscriptionVariables }
) {
  const client = useApolloClient()
  const { variables, onData, onError, onComplete, ...rest } = options

  // Apollo Client 4 delivers subscription errors through `next` and then
  // completes the observable, so `onComplete` fires after a failure too. In v3
  // an error terminated the subscription, and callers still read `onComplete`
  // as "translation succeeded" — so swallow the completion that follows one.
  const erroredRef = useRef(false)

  const subscription = useSubscription<
    JourneyAiTranslateCreateSubscription,
    JourneyAiTranslateCreateSubscriptionVariables
  >(JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION, {
    ...rest,
    // Apollo Client 4 types `variables` as required whenever the operation
    // declares required ones, but callers mount this hook before the
    // translation request exists and pair the absent variables with `skip`.
    skip: rest.skip === true || variables == null,
    variables: variables as JourneyAiTranslateCreateSubscriptionVariables,
    onData: (result) => {
      erroredRef.current = false
      // Update the Apollo cache with the translated journey (only when complete)
      if (result.data.data?.journeyAiTranslateCreateSubscription?.journey) {
        updateCacheWithTranslatedJourney(
          client,
          result.data.data.journeyAiTranslateCreateSubscription.journey
        )
      }

      // Always trigger the existing onData callback for progress updates
      onData?.(result)
    },
    onError: (error) => {
      erroredRef.current = true
      onError?.(error)
    },
    onComplete: () => {
      if (erroredRef.current) {
        erroredRef.current = false
        return
      }
      onComplete?.()
    }
  })

  return subscription
}
