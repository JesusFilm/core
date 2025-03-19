import { spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import { pipeline } from 'stream/promises'

import { Logger } from 'pino'

import { service } from './service'

// Mock fs functions
jest.mock('fs', () => ({
  createWriteStream: jest.fn(),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined)
  }
}))

// Mock stream/promises
jest.mock('stream/promises', () => ({
  pipeline: jest.fn().mockResolvedValue(undefined)
}))

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => {
    const mockProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn()
    }

    // Simulate successful completion
    setTimeout(() => {
      const closeHandler = mockProcess.on.mock.calls.find(
        (call) => call[0] === 'close'
      )[1]
      closeHandler(0) // Call with exit code 0 (success)
    }, 10)

    return mockProcess
  })
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Database Import Service', () => {
  // Mock environment variables
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      PG_DATABASE_URL_LANGUAGES:
        'postgresql://postgres:postgres@localhost:5432/languages?schema=public',
      DB_SEED_URL: 'https://example.com/backup.pgdump'
    }

    // Mock successful fetch response
    mockFetch.mockResolvedValue({
      ok: true,
      body: new ReadableStream()
    })

    // Mock createWriteStream
    ;(fs.createWriteStream as jest.Mock).mockReturnValue({
      write: jest.fn(),
      end: jest.fn()
    })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should download and import database using pg_restore', async () => {
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await service(mockLogger)

    // Verify temp directory was created
    expect(fsPromises.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('imports'),
      { recursive: true }
    )

    // Verify file was downloaded
    expect(mockFetch).toHaveBeenCalledWith(process.env.DB_SEED_URL)
    expect(fs.createWriteStream).toHaveBeenCalledWith(
      expect.stringContaining('languages-backup.pgdump')
    )
    expect(pipeline).toHaveBeenCalled()

    // Verify pg_restore command was called with correct parameters
    expect(spawn).toHaveBeenCalledWith(
      'pg_restore',
      expect.arrayContaining([
        '-h',
        'localhost',
        '-p',
        '5432',
        '-U',
        'postgres',
        '-d',
        'languages',
        '--clean',
        '--if-exists',
        '--no-owner',
        '--no-privileges',
        '--single-transaction',
        expect.stringContaining('languages-backup.pgdump')
      ]),
      expect.objectContaining({
        env: expect.objectContaining({
          PGPASSWORD: 'postgres'
        })
      })
    )

    // Verify downloaded file was cleaned up
    expect(fsPromises.unlink).toHaveBeenCalledWith(
      expect.stringContaining('languages-backup.pgdump')
    )

    // Verify logger was used
    expect(mockLogger.info).toHaveBeenCalledWith('Downloading database file')
    expect(mockLogger.info).toHaveBeenCalledWith('Download completed')
    expect(mockLogger.info).toHaveBeenCalledWith('Starting database restore')
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Database restore completed successfully'
    )
  })

  it('should throw an error if DB_SEED_URL is not set', async () => {
    delete process.env.DB_SEED_URL

    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await expect(service(mockLogger)).rejects.toThrow(
      'DB_SEED_URL environment variable is not set'
    )
  })

  it('should throw an error if download fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    })

    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await expect(service(mockLogger)).rejects.toThrow(
      'Failed to download file: Not Found'
    )
  })

  it('should throw an error if database URL is not set', async () => {
    delete process.env.PG_DATABASE_URL_LANGUAGES

    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await expect(service(mockLogger)).rejects.toThrow()
  })
})
