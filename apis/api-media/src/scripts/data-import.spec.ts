import { vi, type Mock } from 'vitest'

import { spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import { createInterface } from 'readline'
import { createGunzip } from 'zlib'

import main, { preprocessSqlFile } from './data-import'

// Mock fs functions
vi.mock('fs', () => {
  const fsMock = {
    createReadStream: vi.fn().mockReturnValue({
      pipe: vi.fn().mockReturnThis(),
      on: vi.fn((event, handler) => {
        if (event === 'data') {
          // Simulate some data being read
          handler(Buffer.from('test data'))
        }
        return { pipe: vi.fn().mockReturnThis(), on: vi.fn() }
      })
    }),
    createWriteStream: vi.fn().mockReturnValue({
      write: vi.fn(),
      end: vi.fn(),
      on: vi.fn((event, handler) => {
        if (event === 'finish') {
          // Simulate write stream finishing
          setTimeout(() => handler(), 0)
        }
        return { write: vi.fn(), end: vi.fn(), on: vi.fn() }
      })
    }),
    promises: {
      mkdir: vi.fn().mockResolvedValue(undefined),
      unlink: vi.fn().mockResolvedValue(undefined),
      access: vi.fn().mockResolvedValue(undefined),
      stat: vi.fn().mockResolvedValue({ size: 1000 }),
      readFile: vi
        .fn()
        .mockResolvedValue('CREATE PUBLICATION bq_publication FOR ALL TABLES;'),
      writeFile: vi.fn().mockResolvedValue(undefined)
    }
  }
  return { ...fsMock, default: fsMock }
})

// Mock stream
vi.mock('stream', () => ({
  Readable: {
    fromWeb: vi.fn().mockReturnValue({
      pipe: vi.fn().mockReturnThis()
    })
  }
}))

// Mock stream/promises
vi.mock('stream/promises', () => ({
  pipeline: vi.fn().mockImplementation((...args) => {
    // Simulate the pipeline completing successfully
    return Promise.resolve()
  })
}))

// Mock zlib
vi.mock('zlib', () => ({
  createGunzip: vi.fn().mockReturnValue({
    pipe: vi.fn().mockReturnThis()
  })
}))

// Mock readline
vi.mock('readline', () => ({
  createInterface: vi.fn().mockReturnValue({
    [Symbol.asyncIterator]: vi.fn().mockReturnValue({
      next: vi
        .fn()
        .mockResolvedValueOnce({
          value: 'CREATE TABLE test (id INT);',
          done: false
        })
        .mockResolvedValueOnce({
          value: 'CREATE PUBLICATION pub FOR ALL TABLES;',
          done: false
        })
        .mockResolvedValueOnce({
          value: 'INSERT INTO test VALUES (1);',
          done: false
        })
        .mockResolvedValueOnce({ done: true })
    })
  })
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
      if (closeHandler) {
        closeHandler(0) // Call with exit code 0 (success)
      }
    }, 10)

    return mockProcess
  })
}))

// Mock prisma client
vi.mock('../../../../libs/prisma/media/src/client', () => {
  const upsert = vi.fn().mockResolvedValue({ id: 1 })
  return {
    prisma: {
      importTimes: { upsert }
    }
  }
})

// Mock fetch function
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Map([['content-length', '1000']]),
  body: {
    pipeThrough: vi.fn().mockReturnValue({
      getReader: vi.fn().mockReturnValue({
        read: vi
          .fn()
          .mockResolvedValue({ done: true, value: new Uint8Array() })
      })
    })
  },
  text: vi.fn().mockResolvedValue('')
})

// Mock path.join
vi.mock('path', () => ({
  join: vi.fn().mockImplementation((...args) => args.join('/'))
}))

// Mock console and process.exit
vi.spyOn(console, 'log').mockImplementation(() => undefined)
vi.spyOn(console, 'error').mockImplementation(() => undefined)
vi.spyOn(console, 'warn').mockImplementation(() => undefined)
vi
  .spyOn(process, 'exit')
  .mockImplementation(((code?: number | string | null) => undefined) as any)

describe('data-import script', () => {
  const originalEnv = process.env
  const originalCwd = process.cwd

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock process.cwd to return a known path
    process.cwd = vi.fn().mockReturnValue('/workspace')

    process.env = {
      ...originalEnv,
      DB_SEED_PATH: 'https://example.com/backups',
      PG_DATABASE_URL_MEDIA:
        'postgresql://postgres:postgres@localhost:5432/media?schema=public'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    process.cwd = originalCwd
  })

  it('should execute the complete import process', async () => {
    await main()

    // Verify directory was created
    expect(fsPromises.mkdir).toHaveBeenCalled()

    // Verify download was executed
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/backups/media-backup.sql.gz',
      expect.any(Object)
    )

    // Verify decompression was executed
    expect(createGunzip).toHaveBeenCalled()

    // Verify SQL file was preprocessed using streaming
    expect(fs.createReadStream).toHaveBeenCalled()
    expect(fs.createWriteStream).toHaveBeenCalled()

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
        'media',
        '-c',
        'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
      ]),
      expect.any(Object)
    )

    // Verify cleanup was performed
    expect(fsPromises.unlink).toHaveBeenCalled()

    // Verify process exit
    expect(process.exit).toHaveBeenCalledWith(0)
  })

  it('should throw an error if DB_SEED_PATH is not set', async () => {
    delete process.env.DB_SEED_PATH

    await main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('should throw an error if PG_DATABASE_URL_MEDIA is not set', async () => {
    delete process.env.PG_DATABASE_URL_MEDIA

    await main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('should handle download errors', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
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
        if (closeHandler) {
          closeHandler(1) // Call with exit code 1 (failure)
        }
      }, 10)

      return mockProcess
    })

    await main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  describe('preprocessSqlFile', () => {
    it('should process SQL files using streaming and filter out CREATE PUBLICATION statements', async () => {
      // Mock createInterface to return lines including CREATE PUBLICATION statements
      const mockLines = [
        'CREATE TABLE test (id INT);',
        'CREATE PUBLICATION pub1 FOR ALL TABLES;',
        'INSERT INTO test VALUES (1);',
        'CREATE PUBLICATION pub2 FOR TABLE test;',
        'SELECT * FROM test;'
      ]

      const mockReadlineInterface = {
        [Symbol.asyncIterator]: vi.fn().mockReturnValue({
          next: vi
            .fn()
            .mockResolvedValueOnce({ value: mockLines[0], done: false })
            .mockResolvedValueOnce({ value: mockLines[1], done: false })
            .mockResolvedValueOnce({ value: mockLines[2], done: false })
            .mockResolvedValueOnce({ value: mockLines[3], done: false })
            .mockResolvedValueOnce({ value: mockLines[4], done: false })
            .mockResolvedValueOnce({ done: true })
        })
      }

      ;(createInterface as Mock).mockReturnValueOnce(mockReadlineInterface)

      const mockWriteStream: any = {
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn((event: string, handler: () => void) => {
          if (event === 'finish') {
            setTimeout(() => handler(), 0)
          }
          return mockWriteStream
        })
      }

      ;(fs.createWriteStream as Mock).mockReturnValueOnce(mockWriteStream)

      await preprocessSqlFile('/input/test.sql', '/output/test.sql')

      // Verify createInterface was called
      expect(createInterface).toHaveBeenCalled()

      // Verify write stream was created
      expect(fs.createWriteStream).toHaveBeenCalledWith('/output/test.sql')

      // Verify only non-publication statements were written
      expect(mockWriteStream.write).toHaveBeenCalledWith(
        'CREATE TABLE test (id INT);\n'
      )
      expect(mockWriteStream.write).toHaveBeenCalledWith(
        'INSERT INTO test VALUES (1);\n'
      )
      expect(mockWriteStream.write).toHaveBeenCalledWith(
        'SELECT * FROM test;\n'
      )

      // Verify CREATE PUBLICATION statements were NOT written
      expect(mockWriteStream.write).not.toHaveBeenCalledWith(
        'CREATE PUBLICATION pub1 FOR ALL TABLES;\n'
      )
      expect(mockWriteStream.write).not.toHaveBeenCalledWith(
        'CREATE PUBLICATION pub2 FOR TABLE test;\n'
      )

      // Verify stream was properly closed
      expect(mockWriteStream.end).toHaveBeenCalled()
    })
  })
})
