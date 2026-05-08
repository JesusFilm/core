import { spawn } from 'child_process'
import { promises as fsPromises } from 'fs'
import { createGunzip } from 'zlib'

import { Mock, vi } from 'vitest'

import main from './data-import'

// Mock fs functions
vi.mock('fs', () => {
  const createReadStream = vi.fn().mockReturnValue({
    pipe: vi.fn().mockReturnThis()
  })
  const createWriteStream = vi.fn().mockReturnValue({
    write: vi.fn(),
    end: vi.fn()
  })
  const promises = {
    mkdir: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
    access: vi.fn().mockResolvedValue(undefined),
    stat: vi.fn().mockResolvedValue({ size: 1000 }),
    readFile: vi
      .fn()
      .mockResolvedValue('CREATE PUBLICATION bq_publication FOR ALL TABLES;'),
    writeFile: vi.fn().mockResolvedValue(undefined)
  }
  return {
    default: { createReadStream, createWriteStream, promises },
    createReadStream,
    createWriteStream,
    promises
  }
})

// Mock zlib
vi.mock('zlib', () => ({
  createGunzip: vi.fn().mockReturnValue({
    pipe: vi.fn().mockReturnThis()
  })
}))

// Mock stream/promises
vi.mock('stream/promises', () => ({
  pipeline: vi.fn().mockResolvedValue(undefined)
}))

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn().mockImplementation(() => {
    const mockProcess = {
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn()
    }

    // Simulate successful completion
    setTimeout(() => {
      const closeHandler = mockProcess.on.mock.calls.find(
        (call) => call[0] === 'close'
      )?.[1]
      if (closeHandler == null) throw new Error('close handler was not registered')
      closeHandler(0) // Call with exit code 0 (success)
    }, 10)

    return mockProcess
  })
}))

// Mock prisma client
vi.mock('../../../../libs/prisma/languages/src/client', () => {
  const upsert = vi.fn().mockResolvedValue({ id: 1 })
  return {
    prisma: {
      importTimes: { upsert }
    }
  }
})

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  body: {
    getReader: vi.fn()
  }
})

// Mock console and process.exit
vi.spyOn(console, 'log').mockImplementation(() => undefined)
vi.spyOn(console, 'error').mockImplementation(() => undefined)
vi.spyOn(console, 'warn').mockImplementation(() => undefined)
vi.spyOn(process, 'exit').mockImplementation(
  ((code?: number | string | null) => undefined) as any
)

// Mock stream
vi.mock('stream', () => ({
  Readable: {
    fromWeb: vi.fn().mockReturnValue({
      pipe: vi.fn().mockReturnThis()
    })
  }
}))

describe('data-import script', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
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
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: vi.fn().mockResolvedValueOnce('File not found')
    })

    await main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('should handle psql process errors', async () => {
    ;(spawn as Mock).mockImplementationOnce(() => {
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn()
      }

      // Simulate failure
      setTimeout(() => {
        const closeHandler = mockProcess.on.mock.calls.find(
          (call) => call[0] === 'close'
        )?.[1]
        if (closeHandler == null) throw new Error('close handler was not registered')
        closeHandler(1) // Call with exit code 1 (failure)
      }, 10)

      return mockProcess
    })

    await main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
