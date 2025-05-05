import { gql, useSubscription } from '@apollo/client'

import {
  JourneyAiTranslateStatus,
  JourneyAiTranslateStatusVariables
} from '../../../__generated__/JourneyAiTranslateStatus'

export const JOURNEY_AI_TRANSLATE_STATUS = gql`
  subscription JourneyAiTranslateStatus($jobId: ID!) {
    journeyAiTranslateStatus(jobId: $jobId) {
      id
      status
      progress
    }
  }
`

/**
 * TranslationStatus represents the current status of a journey translation job
 */
export interface TranslationStatus {
  id: string
  status: string
  progress: number
}

/**
 * Hook for subscribing to the status of a journey AI translation job
 *
 * @param jobId - The ID of the translation job to track
 * @returns An object containing:
 * - data: The current status of the translation job
 * - loading: Boolean indicating if the subscription is being established
 * - error: Any errors that occurred during the subscription
 */
export function useJourneyAiTranslateStatusSubscription(jobId: string): {
  data: TranslationStatus | undefined
  loading: boolean
  error: any
} {
  const { data, loading, error } = useSubscription<
    JourneyAiTranslateStatus,
    JourneyAiTranslateStatusVariables
  >(JOURNEY_AI_TRANSLATE_STATUS, {
    variables: { jobId }
  })

  return {
    data: data?.journeyAiTranslateStatus ?? undefined,
    loading,
    error
  }
}
