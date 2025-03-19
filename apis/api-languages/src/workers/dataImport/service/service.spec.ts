import { spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'

import { Logger } from 'pino'

import { service } from './service'

// Mock fs functions
jest.mock('fs', () => ({
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn().mockReturnThis()
  }),
  createWriteStream: jest.fn().mockReturnValue({
    write: jest.fn(),
    end: jest.fn()
  }),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined)
  }
}))

// Mock zlib
jest.mock('zlib', () => ({
  createGunzip: jest.fn().mockReturnValue({
    pipe: jest.fn().mockReturnThis()
  })
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

describe('Database Import Service', () => {
  // Mock environment variables
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      PG_DATABASE_URL_LANGUAGES:
        'postgresql://postgres:postgres@localhost:5432/languages?schema=public',
      DB_SEED_PATH: '/path/to/languages-backup.sql.gz'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should decompress and import database using psql', async () => {
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

    // Verify decompression was performed
    expect(fs.createReadStream).toHaveBeenCalledWith(process.env.DB_SEED_PATH)
    expect(fs.createWriteStream).toHaveBeenCalledWith(
      expect.stringContaining('languages-backup.sql')
    )
    expect(createGunzip).toHaveBeenCalled()
    expect(pipeline).toHaveBeenCalled()

    // Verify psql command was called with correct parameters
    expect(spawn).toHaveBeenCalledWith(
      'psql',
      expect.arrayContaining([
        '-h',
        'localhost',
        '-p',
        '5432',
        '-U',
        'postgres',
        '-d',
        'languages',
        '-v',
        'ON_ERROR_STOP=1',
        '--single-transaction',
        '-f',
        expect.stringContaining('languages-backup.sql')
      ]),
      expect.objectContaining({
        env: expect.objectContaining({
          PGPASSWORD: 'postgres'
        })
      })
    )

    // Verify temporary file was cleaned up
    expect(fsPromises.unlink).toHaveBeenCalledWith(
      expect.stringContaining('languages-backup.sql')
    )

    // Verify logger was used
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Using SQL backup from path: ${process.env.DB_SEED_PATH}`
    )
    expect(mockLogger.info).toHaveBeenCalledWith('Decompressing gzipped file')
    expect(mockLogger.info).toHaveBeenCalledWith('File decompression completed')
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Starting database restore with psql'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Database restore completed successfully'
    )
  })

  it('should throw an error if DB_SEED_PATH is not set', async () => {
    delete process.env.DB_SEED_PATH

    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await expect(service(mockLogger)).rejects.toThrow(
      'DB_SEED_PATH environment variable is not set'
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
