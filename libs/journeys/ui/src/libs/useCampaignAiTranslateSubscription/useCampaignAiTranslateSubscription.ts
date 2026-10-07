import { gql } from '@apollo/client'
import { useApolloClient, useSubscription } from '@apollo/client/react'
import { useRef } from 'react'

import { SUPPORTED_LANGUAGE_IDS } from '../useJourneyAiTranslateSubscription/supportedLanguages'

import {
  CampaignAiTranslateSubscription,
  CampaignAiTranslateSubscriptionVariables
} from './__generated__/CampaignAiTranslateSubscription'

export const CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION = gql`
  subscription CampaignAiTranslateSubscription(
    $campaignId: ID!
    $languageId: ID!
    $mode: CampaignAiTranslateMode!
  ) {
    campaignAiTranslateSubscription(
      input: { campaignId: $campaignId, languageId: $languageId, mode: $mode }
    ) {
      progress
      message
      campaign {
        id
        titleTranslations {
          languageId
          value
          source
        }
      }
    }
  }
`

/** `all` also replaces the machine's earlier translations; `missing` fills only the gaps. A person's are never replaced. */
export interface CampaignAiTranslateVariables {
  campaignId: string
  languageId: string
  mode: 'all' | 'missing'
}

/**
 * Whether the translation model covers a language. A language outside the
 * list is "manual only": it is written by hand and gets no machine sweep.
 */
export function isMachineTranslatable(languageId: string): boolean {
  return (SUPPORTED_LANGUAGE_IDS as readonly string[]).includes(languageId)
}

/**
 * Machine-translate a campaign into one of its languages over SSE, reporting
 * progress per batch. The run starts when `variables` are given and does not
 * restart on its own: nothing edited afterwards triggers it again. When a run
 * finishes the cached Translations view rows are dropped, so the view reads
 * what the machine wrote the next time it is shown (or at once if it is open).
 */
export function useCampaignAiTranslateSubscription(
  options: Omit<
    useSubscription.Options<
      CampaignAiTranslateSubscription,
      CampaignAiTranslateSubscriptionVariables
    >,
    'variables'
  > & { variables?: CampaignAiTranslateVariables }
) {
  const client = useApolloClient()
  const { variables, onData, onError, onComplete, ...rest } = options

  // Apollo Client 4 delivers subscription errors through `next` and then
  // completes the observable, so `onComplete` fires after a failure too;
  // callers read `onComplete` as "translation succeeded", so swallow the
  // completion that follows an error.
  const erroredRef = useRef(false)

  return useSubscription<
    CampaignAiTranslateSubscription,
    CampaignAiTranslateSubscriptionVariables
  >(CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION, {
    ...rest,
    skip: rest.skip === true || variables == null,
    variables: variables as unknown as CampaignAiTranslateSubscriptionVariables,
    onData: (result) => {
      erroredRef.current = false
      if (result.data.data?.campaignAiTranslateSubscription.campaign != null) {
        client.cache.evict({
          id: 'ROOT_QUERY',
          fieldName: 'campaignTranslations'
        })
        client.cache.gc()
      }
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
}
