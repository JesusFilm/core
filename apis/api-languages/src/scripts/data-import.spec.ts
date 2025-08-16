import { spawn } from 'child_process'
import { promises as fsPromises } from 'fs'
import { createGunzip } from 'zlib'

import main from './data-import'

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
    unlink: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({ size: 1000 }),
    readFile: jest
      .fn()
      .mockResolvedValue('CREATE PUBLICATION bq_publication FOR ALL TABLES;'),
    writeFile: jest.fn().mockResolvedValue(undefined)
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

// Mock prisma client
jest.mock('.prisma/api-languages-client', () => {
  const upsert = jest.fn().mockResolvedValue({ id: 1 })
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      importTimes: {
        upsert
      }
    }))
  }
})

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  body: {
    getReader: jest.fn()
  }
})

// Mock console and process.exit
jest.spyOn(console, 'log').mockImplementation(() => undefined)
jest.spyOn(console, 'error').mockImplementation(() => undefined)
jest.spyOn(console, 'warn').mockImplementation(() => undefined)
jest
  .spyOn(process, 'exit')
  .mockImplementation(((code?: number | string | null) => undefined) as any)

// Mock stream
jest.mock('stream', () => ({
  Readable: {
    fromWeb: jest.fn().mockReturnValue({
      pipe: jest.fn().mockReturnThis()
    })
  }
}))

describe('data-import script', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      DB_SEED_PATH: 'https://example.com/backups',
      PG_DATABASE_URL_LANGUAGES:
        'postgresql://postgres:postgres@localhost:5432/languages?schema=public'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should execute the complete import process', async () => {
    await main()

    // Verify directory was created
    expect(fsPromises.mkdir).toHaveBeenCalled()

    // Verify download was executed
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/backups/languages-backup.sql.gz',
      expect.any(Object)
    )

    // Verify decompression was executed
    expect(createGunzip).toHaveBeenCalled()

    // Verify SQL file was preprocessed
    expect(fsPromises.readFile).toHaveBeenCalled()
    expect(fsPromises.writeFile).toHaveBeenCalled()

    // Verify psql command was executed with the preprocessed file
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
        '-c',
        'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
      ]),
      expect.any(Object)
    )

    // Verify cleanup was performed
    expect(fsPromises.unlink).toHaveBeenCalledTimes(3) // Now cleaning up 3 files (gzipped, sql, and processed sql)

    // Verify process exit
    expect(process.exit).toHaveBeenCalledWith(0)
  })

  it('should throw an error if DB_SEED_PATH is not set', async () => {
    delete process.env.DB_SEED_PATH

    await main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('should throw an error if PG_DATABASE_URL_LANGUAGES is not set', async () => {
    delete process.env.PG_DATABASE_URL_LANGUAGES

    await main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('should handle download errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: jest.fn().mockResolvedValueOnce('File not found')
    })

    await main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('should handle psql process errors', async () => {
    ;(spawn as jest.Mock).mockImplementationOnce(() => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn()
      }

      // Simulate failure
      setTimeout(() => {
        const closeHandler = mockProcess.on.mock.calls.find(
          (call) => call[0] === 'close'
        )[1]
        closeHandler(1) // Call with exit code 1 (failure)
      }, 10)

      return mockProcess
    })

    await main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
