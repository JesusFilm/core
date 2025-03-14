import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'

import { Logger } from 'pino'

import { service } from './service'

// Mock fs functions
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn().mockResolvedValue(true),
    mkdir: jest.fn().mockResolvedValue(undefined),
    rm: jest.fn().mockResolvedValue(undefined)
  }
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
        'postgresql://postgres:postgres@localhost:5432/languages?schema=public'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should import database using pg_restore', async () => {
    // Create a mock logger
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    const filePath = '/path/to/backup.pgdump'
    const options = { clearExistingData: false }

    await service(filePath, options, mockLogger)

    // Verify file existence was checked
    expect(fs.stat).toHaveBeenCalledWith(filePath)

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
        '-v',
        '--single-transaction',
        filePath
      ]),
      expect.objectContaining({
        env: expect.objectContaining({
          PGPASSWORD: 'postgres'
        })
      })
    )

    // Verify logger was used
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ filePath }),
      'Starting database import'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Database import completed successfully'
    )
  })

  it('should include --clean flag when clearExistingData is true', async () => {
    // Create a mock logger
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    const filePath = '/path/to/backup.pgdump'
    const options = { clearExistingData: true }

    await service(filePath, options, mockLogger)

    // Verify pg_restore command was called with --clean flag
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
        '-v',
        '--clean',
        '--single-transaction',
        filePath
      ]),
      expect.any(Object)
    )
  })

  it('should throw an error if file does not exist', async () => {
    // Mock fs.stat to return false
    ;(fs.stat as jest.Mock).mockRejectedValueOnce(new Error('File not found'))

    // Create a mock logger
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    const filePath = '/path/to/nonexistent.pgdump'
    const options = { clearExistingData: false }

    await expect(service(filePath, options, mockLogger)).rejects.toThrow(
      'File not found'
    )
  })

  it('should warn if file does not have .pgdump extension', async () => {
    // Create a mock logger
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    const filePath = '/path/to/backup.txt'
    const options = { clearExistingData: false }

    await service(filePath, options, mockLogger)

    // Verify warning was logged
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'File does not have .pgdump extension, but proceeding anyway'
    )
  })

  it('should throw an error if database URL is not set', async () => {
    // Remove database URL from environment
    delete process.env.PG_DATABASE_URL_LANGUAGES

    // Create a mock logger
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    const filePath = '/path/to/backup.pgdump'
    const options = { clearExistingData: false }

    await expect(service(filePath, options, mockLogger)).rejects.toThrow()
  })
})
