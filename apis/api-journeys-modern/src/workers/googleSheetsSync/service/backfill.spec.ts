import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'
import { getIntegrationGoogleAccessToken } from '../../../lib/google/googleAuth'
import {
  clearSheet,
  ensureSheet,
  readValues,
  writeValues
} from '../../../lib/google/sheets'
import { GoogleSheetsSyncBackfillJobData } from '../queue'

import { backfillService } from './backfill'

jest.mock('../../../lib/google/googleAuth', () => ({
  getIntegrationGoogleAccessToken: jest.fn()
}))

jest.mock('../../../lib/google/sheets', () => {
  const actual = jest.requireActual('../../../lib/google/sheets')
  return {
    ...actual,
    clearSheet: jest.fn(),
    ensureSheet: jest.fn(),
    readValues: jest.fn(),
    writeValues: jest.fn()
  }
})

const mockGetIntegrationGoogleAccessToken =
  getIntegrationGoogleAccessToken as jest.MockedFunction<
    typeof getIntegrationGoogleAccessToken
  >
const mockEnsureSheet = ensureSheet as jest.MockedFunction<typeof ensureSheet>
const mockReadValues = readValues as jest.MockedFunction<typeof readValues>
const mockClearSheet = clearSheet as jest.MockedFunction<typeof clearSheet>
const mockWriteValues = writeValues as jest.MockedFunction<typeof writeValues>

const backfillJob: Job<GoogleSheetsSyncBackfillJobData> = {
  name: 'google-sheets-sync-backfill',
  data: {
    type: 'backfill',
    journeyId: 'journey-id',
    teamId: 'team-id',
    syncId: 'sync-id',
    spreadsheetId: 'spreadsheet-id',
    sheetName: 'Sheet1',
    timezone: 'UTC',
    integrationId: 'integration-id'
  }
} as unknown as Job<GoogleSheetsSyncBackfillJobData>

describe('backfillService', () => {
  let logger: Logger

  beforeEach(() => {
    jest.clearAllMocks()
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as unknown as Logger

    prismaMock.googleSheetsSync.findFirst.mockResolvedValue({
      id: 'sync-id'
    } as any)
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      blocks: []
    } as any)
    prismaMock.event.findMany.mockResolvedValue([] as any)
    prismaMock.journeyVisitor.findMany.mockResolvedValue([] as any)

    mockGetIntegrationGoogleAccessToken.mockResolvedValue({
      accessToken: 'access-token',
      accountEmail: 'example@example.com'
    })
    mockEnsureSheet.mockResolvedValue(undefined)
  })

  it('skips clear/write when sheet content is unchanged', async () => {
    mockReadValues.mockResolvedValue([['Visitor ID', 'Date']])

    await backfillService(backfillJob, logger)

    expect(mockReadValues).toHaveBeenCalledWith({
      accessToken: 'access-token',
      spreadsheetId: 'spreadsheet-id',
      range: "'Sheet1'!A:B"
    })
    expect(mockClearSheet).not.toHaveBeenCalled()
    expect(mockWriteValues).not.toHaveBeenCalled()
  })

  it('clears and rewrites when sheet content changed', async () => {
    mockReadValues.mockResolvedValue([['Visitor ID', 'Date (Old)']])

    await backfillService(backfillJob, logger)

    expect(mockClearSheet).toHaveBeenCalledWith({
      accessToken: 'access-token',
      spreadsheetId: 'spreadsheet-id',
      sheetTitle: 'Sheet1'
    })
    expect(mockWriteValues).toHaveBeenCalledWith({
      accessToken: 'access-token',
      spreadsheetId: 'spreadsheet-id',
      sheetTitle: 'Sheet1',
      values: [['Visitor ID', 'Date']],
      append: false
    })
  })

  it('clears and rewrites when existing sheet has more rows than new data', async () => {
    mockReadValues.mockResolvedValue([
      ['Visitor ID', 'Date'],
      ['visitor-1', '2026-01-01']
    ])

    await backfillService(backfillJob, logger)

    expect(mockClearSheet).toHaveBeenCalled()
    expect(mockWriteValues).toHaveBeenCalled()
  })

  it('clears and rewrites when existing sheet is empty', async () => {
    mockReadValues.mockResolvedValue([])

    await backfillService(backfillJob, logger)

    expect(mockClearSheet).toHaveBeenCalled()
    expect(mockWriteValues).toHaveBeenCalled()
  })

  it('falls through to write when readValues fails', async () => {
    mockReadValues.mockRejectedValue(new Error('API rate limit exceeded'))

    await backfillService(backfillJob, logger)

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      'Failed to read existing sheet values, proceeding with full write'
    )
    expect(mockClearSheet).toHaveBeenCalled()
    expect(mockWriteValues).toHaveBeenCalled()
  })

  it('skips backfill when sync is not found', async () => {
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)

    await backfillService(backfillJob, logger)

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ syncId: 'sync-id' }),
      'Sync not found or deleted, skipping backfill'
    )
    expect(mockEnsureSheet).not.toHaveBeenCalled()
    expect(mockReadValues).not.toHaveBeenCalled()
  })

  it('skips backfill when journey is not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    await backfillService(backfillJob, logger)

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ journeyId: 'journey-id' }),
      'Journey not found, skipping backfill'
    )
    expect(mockEnsureSheet).not.toHaveBeenCalled()
  })
})
