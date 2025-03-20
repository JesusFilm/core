import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'

import {
  CopyObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Logger } from 'pino'

import { service } from './service'

jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => {
    const mockEventEmitter = {
      on: jest.fn().mockReturnThis(),
      stderr: { on: jest.fn() },
      stdout: { pipe: jest.fn(), on: jest.fn() }
    }
    return mockEventEmitter
  })
}))

jest.mock('@aws-sdk/client-s3', () => {
  return {
    CopyObjectCommand: jest.fn().mockImplementation((args) => args),
    HeadObjectCommand: jest.fn().mockImplementation((args) => args),
    PutObjectCommand: jest.fn().mockImplementation((args) => args),
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({})
    }))
  }
})

jest.mock('stream/promises', () => ({
  pipeline: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('test')),
    unlink: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({ size: 100 })
  },
  createReadStream: jest.fn().mockReturnValue({ pipe: jest.fn() }),
  createWriteStream: jest.fn().mockReturnValue({ pipe: jest.fn() }),
  stat: jest
    .fn()
    .mockImplementation((path, callback) => callback(null, { size: 100 })),
  unlink: jest.fn().mockImplementation((path, callback) => callback(null))
}))

jest.mock('zlib', () => ({
  createGzip: jest.fn().mockReturnValue({ pipe: jest.fn() })
}))

describe('dataExport service', () => {
  let logger: Partial<Logger>
  let mockSpawn: jest.Mock
  let mockEventEmitter: any

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      child: jest.fn().mockReturnValue({
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
      })
    }

    // Mock environment variables
    process.env.CLOUDFLARE_R2_ENDPOINT = 'https://test.r2.dev'
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = 'test-access-key'
    process.env.CLOUDFLARE_R2_SECRET = 'test-secret'
    process.env.CLOUDFLARE_R2_BUCKET = 'test-bucket'
    process.env.PG_DATABASE_URL_MEDIA =
      'postgres://user:pass@localhost:5432/media'

    mockSpawn = spawn as jest.Mock
    mockEventEmitter = mockSpawn.mock.results[0]?.value || {
      on: jest.fn().mockReturnThis(),
      stderr: { on: jest.fn() },
      stdout: { pipe: jest.fn(), on: jest.fn() }
    }

    // Reset mocks
    mockSpawn.mockClear()
    jest.clearAllMocks()
  })

  it('should successfully export database and upload to R2 (runs automatically daily at midnight)', async () => {
    // Set a longer timeout for this test
    jest.setTimeout(10000)

    // Setup spawn mock to simulate successful process
    mockSpawn.mockImplementation(() => {
      const emitter = {
        on: jest.fn(),
        stderr: { on: jest.fn() },
        stdout: { pipe: jest.fn(), on: jest.fn() }
      }

      // Mock the close event with success code
      emitter.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(0), 10)
        }
        return emitter
      })

      return emitter
    })

    await service(logger as Logger)

    // Verify pg_dump was called with the right arguments for the main backup
    expect(mockSpawn).toHaveBeenCalledWith(
      'pg_dump',
      expect.arrayContaining([
        '-F',
        'p', // PLAIN format
        '--inserts', // Use INSERT statements
        '--no-owner',
        '--no-privileges',
        '--exclude-table',
        'CloudflareImage',
        '--exclude-table',
        'MuxVideo',
        '--exclude-table',
        'CloudflareR2',
        '--exclude-table',
        'UserMediaRole'
      ]),
      expect.anything()
    )

    // Verify the creation of the temporary view for CloudflareImage export
    expect(mockSpawn).toHaveBeenCalledWith(
      'sh',
      expect.arrayContaining([
        '-c',
        expect.stringContaining('CREATE OR REPLACE VIEW temp_cloudflare_export')
      ]),
      expect.anything()
    )

    // Verify the pg_dump for the CloudflareImage export
    expect(mockSpawn).toHaveBeenCalledWith(
      'sh',
      expect.arrayContaining([
        '-c',
        expect.stringContaining('-t "temp_cloudflare_export"')
      ]),
      expect.anything()
    )

    // Verify the sed command to replace the table name
    expect(mockSpawn).toHaveBeenCalledWith(
      'sh',
      expect.arrayContaining([
        '-c',
        expect.stringContaining(
          "sed -i 's/temp_cloudflare_export/CloudflareImage/g'"
        )
      ]),
      expect.anything()
    )

    // Verify file cleanup
    expect(fs.unlink).toHaveBeenCalled()
  })

  it('should handle error during pg_dump', async () => {
    // Setup spawn mock to simulate process failure
    mockSpawn.mockImplementation(() => {
      const emitter = {
        on: jest.fn(),
        stderr: { on: jest.fn() }
      }

      // Mock the close event with error code
      emitter.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(1), 10)
        }
        return emitter
      })

      return emitter
    })

    await expect(service(logger as Logger)).rejects.toThrow(
      'pg_dump process exited with code 1'
    )
  })
})
