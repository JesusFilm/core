import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'

import { Logger } from 'pino'

import { service } from './service'

// Mock fs functions
jest.mock('fs', () => ({
  promises: {
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

describe('Database Export Service', () => {
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

  it('should export database using pg_dump', async () => {
    // Create a mock logger
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await service(mockLogger)

    // Verify output directory was created
    expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('exports'), {
      recursive: true
    })

    // Verify pg_dump command was called with correct parameters
    expect(spawn).toHaveBeenCalledWith(
      'pg_dump',
      expect.arrayContaining([
        '-h',
        'localhost',
        '-p',
        '5432',
        '-U',
        'postgres',
        '-d',
        'languages',
        '-F',
        'c',
        '-Z',
        '9',
        '-v',
        '-f',
        expect.stringContaining('.pgdump')
      ]),
      expect.objectContaining({
        env: expect.objectContaining({
          PGPASSWORD: 'postgres'
        })
      })
    )

    // Verify logger was used
    expect(mockLogger.info).toHaveBeenCalledWith('Starting database export')
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Database export completed successfully')
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
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await expect(service(mockLogger)).rejects.toThrow()
  })
})
