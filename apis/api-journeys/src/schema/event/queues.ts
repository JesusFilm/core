import type { Queue } from 'bullmq'

// Lazily-required BullMQ queues, kept out of eventService so specs can
// inject mocks without the injectors sitting on the service surface.

// Queue for visitor interaction emails
let emailQueue: Queue | null = null
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
let googleSheetsSyncQueue: Queue | null = null
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export function __setEmailQueueForTests(mockQueue: Queue | null): void {
  emailQueue = mockQueue
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function __setGoogleSheetsSyncQueueForTests(
  mockQueue: Queue | null
): void {
  googleSheetsSyncQueue = mockQueue
}
