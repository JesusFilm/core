import { Queue } from 'bullmq'

import { connection } from '../lib/connection'

import { queueName } from './config'

export interface GoogleSheetsSyncRecord {
  id: string
  spreadsheetId: string
  sheetName: string | null
  timezone: string | null
}

export interface GoogleSheetsSyncJobData {
  journeyId: string
  teamId: string
  row: (string | number | null)[]
  sheetName?: string
  syncs: GoogleSheetsSyncRecord[]
}

export const queue = new Queue<GoogleSheetsSyncJobData>(queueName, {
  connection
})
