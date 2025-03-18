import { spawn } from 'child_process'
import fs from 'fs'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

import { service } from './service'

jest.mock('child_process')
jest.mock('fs')
jest.mock('stream/promises')
jest.mock('../../../lib/prisma')

describe('dataImport service', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    child: jest.fn().mockReturnThis()
  } as unknown as Logger

  const mockSpawn = jest.fn()
  const mockOn = jest.fn()
  const mockStdout = { on: jest.fn() }
  const mockStderr = { on: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock environment variables
    process.env.PG_DATABASE_URL_MEDIA = 'postgres://user:pass%23@host:5432/db'
    process.env.DB_SEED_PATH = 'https://example.com/seeds/'

    // Mock spawn
    mockSpawn.mockReturnValue({
      stdout: mockStdout,
      stderr: mockStderr,
      on: mockOn
    })
    ;(spawn as jest.Mock).mockImplementation(mockSpawn)

    // Mock file system functions
    jest.spyOn(fs, 'createReadStream').mockReturnValue('readStream' as any)
    jest.spyOn(fs, 'createWriteStream').mockReturnValue('writeStream' as any)
    jest.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined)
    jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined)

    // Mock pipeline
    ;(pipeline as jest.Mock).mockResolvedValue(undefined)

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: jest.fn()
      }
    })

    // Mock Readable.fromWeb
    ;(Readable.fromWeb as jest.Mock) = jest
      .fn()
      .mockReturnValue('readableStream')
  })

  it('should download, restore database and import CloudflareImage data', async () => {
    // Setup mock for successful process exit
    mockOn.mockImplementation((event, callback) => {
      if (event === 'close') {
        callback(0) // Success exit code
      }
      return { on: mockOn }
    })

    await service(mockLogger)

    // Verify DB_SEED_PATH environment variable check
    expect(process.env.DB_SEED_PATH).toBeDefined()

    // Verify directory creation
    expect(fs.promises.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('imports'),
      { recursive: true }
    )

    // Verify file downloads
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/seeds/media-backup.pgdump'
    )
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/seeds/cloudflareImage-system-data.sql.gz'
    )

    // Verify pg_restore was called
    expect(spawn).toHaveBeenCalledWith(
      'pg_restore',
      expect.any(Array),
      expect.any(Object)
    )

    // Verify psql was called for CloudflareImage import
    expect(spawn).toHaveBeenCalledWith(
      'psql',
      expect.any(Array),
      expect.any(Object)
    )

    // Verify import times were updated
    expect(prisma.importTimes.upsert).toHaveBeenCalledWith({
      where: { modelName: 'dataImport' },
      update: { lastImport: expect.any(Date) },
      create: { modelName: 'dataImport', lastImport: expect.any(Date) }
    })

    // Verify files were cleaned up
    expect(fs.promises.unlink).toHaveBeenCalledTimes(2)
  })

  it('should throw an error if DB_SEED_PATH is not set', async () => {
    delete process.env.DB_SEED_PATH

    await expect(service(mockLogger)).rejects.toThrow(
      'DB_SEED_PATH environment variable is not set'
    )
  })

  it('should throw an error if DB_SEED_PATH is not a valid URL', async () => {
    process.env.DB_SEED_PATH = '/invalid/local/path'

    await expect(service(mockLogger)).rejects.toThrow(
      'DB_SEED_PATH must be a valid URL starting with http:// or https://'
    )
  })

  it('should throw an error if file download fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    })

    await expect(service(mockLogger)).rejects.toThrow(
      'Failed to download file: Not Found'
    )
  })
})
