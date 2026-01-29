import { Queue } from 'bullmq'

import { connection } from '../lib/connection'

import { queueName } from './config'

export interface GoogleSheetsSyncRecord {
  id: string
  spreadsheetId: string
  sheetName: string | null
  timezone: string | null
}

/**
 * Job data for appending a single event row to Google Sheets.
 * This is the real-time sync that happens when events are created.
 */
export interface GoogleSheetsSyncAppendJobData {
  type: 'append'
  journeyId: string
  teamId: string
  row: (string | number | null)[]
  sheetName?: string
  syncs: GoogleSheetsSyncRecord[]
}

/**
 * Job data for backfilling a Google Sheet.
 * Clears all existing data and re-exports all events from scratch.
 */
export interface GoogleSheetsSyncBackfillJobData {
  type: 'backfill'
  journeyId: string
  teamId: string
  syncId: string
  spreadsheetId: string
  sheetName: string
  timezone: string
  integrationId: string
}

/**
 * Job data for initial sheet creation/export.
 * Used when creating a new sync - writes all existing events to the sheet.
 * Similar to backfill but doesn't clear existing data (sheet is new or empty).
 */
export interface GoogleSheetsSyncCreateJobData {
  type: 'create'
  journeyId: string
  teamId: string
  syncId: string
  spreadsheetId: string
  sheetName: string
  timezone: string
  integrationId: string
}

/**
 * Union type for all Google Sheets sync job types.
 * Use discriminated union with 'type' field to determine the job type.
 */
export type GoogleSheetsSyncJobData =
  | GoogleSheetsSyncAppendJobData
  | GoogleSheetsSyncBackfillJobData
  | GoogleSheetsSyncCreateJobData

/**
 * Type guard to check if a job is an append job.
 * Handles legacy jobs that don't have a 'type' field.
 */
export function isAppendJob(
  data: GoogleSheetsSyncJobData
): data is GoogleSheetsSyncAppendJobData {
  return !('type' in data) || data.type === 'append'
}

/**
 * Type guard to check if a job is a backfill job.
 */
export function isBackfillJob(
  data: GoogleSheetsSyncJobData
): data is GoogleSheetsSyncBackfillJobData {
  return 'type' in data && data.type === 'backfill'
}

/**
 * Type guard to check if a job is a create job.
 */
export function isCreateJob(
  data: GoogleSheetsSyncJobData
): data is GoogleSheetsSyncCreateJobData {
  return 'type' in data && data.type === 'create'
}

export const queue = new Queue<GoogleSheetsSyncJobData>(queueName, {
  connection
})
