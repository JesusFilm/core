import type { Queue } from 'bullmq'

// Internal queue holders for the event service. Not part of the event
// service surface — production resolvers import from './eventService' and
// never see the test injectors below.

// Queue for visitor interaction emails
let emailQueue: Queue | null
try {
  // Avoid requiring Redis in tests
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    emailQueue = require('../../workers/emailEvents/queue').queue
  }
} catch {
  emailQueue = null
}

// Queue for Google Sheets sync
let googleSheetsSyncQueue: Queue | null
try {
  // Avoid requiring Redis in tests
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    googleSheetsSyncQueue =
      require('../../workers/googleSheetsSync/queue').queue
  }
} catch {
  googleSheetsSyncQueue = null
}

export function getEmailQueue(): Queue | null {
  return emailQueue
}

export function getGoogleSheetsSyncQueue(): Queue | null {
  return googleSheetsSyncQueue
}

// Test helper to inject a mock queue
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __setEmailQueueForTests(mockQueue: any): void {
  emailQueue = mockQueue
}

// Test helper to inject a mock Google Sheets sync queue
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __setGoogleSheetsSyncQueueForTests(mockQueue: any): void {
  googleSheetsSyncQueue = mockQueue
}
