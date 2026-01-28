import { Job } from 'bullmq'
import { Logger } from 'pino'

import { appendEventToGoogleSheets } from '../../../schema/journeyVisitor/export/googleSheetsLiveSync'
import { GoogleSheetsSyncJobData } from '../queue'

export async function service(
  job: Job<GoogleSheetsSyncJobData>,
  logger?: Logger
): Promise<void> {
  const { journeyId, teamId, row, sheetName, syncs } = job.data

  // syncs are passed from the queue to minimize DB calls; skip if none exist.
  if (syncs.length === 0) return

  try {
    await appendEventToGoogleSheets({ journeyId, teamId, row, sheetName })
  } catch (error) {
    logger?.error(
      { journeyId, teamId, error },
      'Failed to sync event to Google Sheet'
    )
    throw error
  }
}
