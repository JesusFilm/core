import { Job } from 'bullmq'
import { Logger } from 'pino'

import { appendEventToGoogleSheets } from '../../../schema/journeyVisitor/export/googleSheetsLiveSync'
import {
  GoogleSheetsSyncAppendJobData,
  GoogleSheetsSyncBackfillJobData,
  GoogleSheetsSyncCreateJobData,
  GoogleSheetsSyncJobData,
  isBackfillJob,
  isCreateJob
} from '../queue'

import { backfillService } from './backfill'
import { createService } from './create'

/**
 * Main service dispatcher for Google Sheets sync jobs.
 * Routes to appropriate handler based on job type.
 */
export async function service(
  job: Job<GoogleSheetsSyncJobData>,
  logger?: Logger
): Promise<void> {
  // Handle backfill jobs
  if (isBackfillJob(job.data)) {
    return backfillService(job as Job<GoogleSheetsSyncBackfillJobData>, logger)
  }

  // Handle create jobs (initial sheet export)
  if (isCreateJob(job.data)) {
    return createService(job as Job<GoogleSheetsSyncCreateJobData>, logger)
  }

  // Handle append jobs (default for legacy jobs without 'type' field)
  return appendService(job as Job<GoogleSheetsSyncAppendJobData>, logger)
}

/**
 * Append service: adds or updates a single event row in Google Sheets.
 * This is the real-time sync that happens when events are created.
 * Delegates to the shared appendEventToGoogleSheets function.
 */
async function appendService(
  job: Job<GoogleSheetsSyncAppendJobData>,
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
