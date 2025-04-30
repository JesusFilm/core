import { Job } from 'bullmq'

import { journeyAiTranslate } from './journeyAiTranslate'

export interface AiTranslateJourneyJob {
  userId: string
  type: 'journeyAiTranslate'
  journeyId: string
  name: string
  textLanguageId: string
  videoLanguageId: string
}

export type UserQueueJob = AiTranslateJourneyJob

export async function service(job: Job<UserQueueJob>): Promise<void> {
  if (job.data.type === 'journeyAiTranslate') {
    await journeyAiTranslate(job)
  }
}
