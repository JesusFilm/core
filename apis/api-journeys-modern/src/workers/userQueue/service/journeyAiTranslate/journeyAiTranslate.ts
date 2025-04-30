import { Job } from 'bullmq'

import { AiTranslateJourneyJob } from '../service'

export async function journeyAiTranslate(
  job: Job<AiTranslateJourneyJob>
): Promise<void> {
  await duplicateJourney(job)
  await translateJourney(job)
}

export async function duplicateJourney(
  job: Job<AiTranslateJourneyJob>
): Promise<void> {
  await job.updateProgress(25)
  // TODO: Implement
}

export async function translateJourney(
  job: Job<AiTranslateJourneyJob>
): Promise<void> {
  await job.updateProgress(100)
  // TODO: Implement
}
