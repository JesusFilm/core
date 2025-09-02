import { spawn } from 'child_process'
import { createReadStream, createWriteStream, promises as fsPromises } from 'fs'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'

import {
  CopyObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Logger } from 'pino'

import { service } from './service'

// Mock fs functions
jest.mock('fs', () => ({
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn().mockReturnThis()
  }),
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn(),
    once: jest.fn()
  }),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('test'))
  }
}))

// Mock zlib
jest.mock('zlib', () => ({
  createGzip: jest.fn().mockReturnValue({
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

// Mock S3Client
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn().mockImplementation((command) => {
    if (command.constructor.name === 'HeadObjectCommand') {
      // Simulate file not found by default
      throw new Error('NotFound')
    }
    return {}
  })
  const MockS3Client = jest.fn().mockImplementation(() => ({
    send: mockSend
  }))
  return {
    S3Client: MockS3Client,
    HeadObjectCommand: jest.fn().mockImplementation((params) => ({
      constructor: { name: 'HeadObjectCommand' },
      ...params
    })),
    CopyObjectCommand: jest.fn().mockImplementation((params) => ({
      constructor: { name: 'CopyObjectCommand' },
      ...params
    })),
    PutObjectCommand: jest.fn().mockImplementation((params) => ({
      constructor: { name: 'PutObjectCommand' },
      ...params
    }))
  }
})

describe('Database Export Service', () => {
  // Mock environment variables
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      PG_DATABASE_URL_LANGUAGES:
        'postgresql://postgres:postgres@localhost:5432/languages?schema=public',
      CLOUDFLARE_R2_ENDPOINT: 'https://test.r2.cloudflarestorage.com',
      CLOUDFLARE_R2_ACCESS_KEY_ID: 'test-key',
      CLOUDFLARE_R2_SECRET: 'test-secret',
      CLOUDFLARE_R2_BUCKET: 'test-bucket'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should export database and upload to R2', async () => {
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await service(mockLogger)

    // Verify output directory was created
    expect(fsPromises.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('exports'),
      {
        recursive: true
      }
    )

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
        '--no-owner',
        '--no-privileges',
        '--no-publications',
        '--no-subscriptions',
        '-f',
        expect.stringContaining('languages-backup.sql')
      ]),
      expect.objectContaining({
        env: expect.objectContaining({
          PGPASSWORD: 'postgres'
        })
      })
    )

    // Verify compression was performed
    expect(createReadStream).toHaveBeenCalledWith(
      expect.stringContaining('languages-backup.sql')
    )
    expect(createWriteStream).toHaveBeenCalledWith(
      expect.stringContaining('languages-backup.sql.gz')
    )
    expect(createGzip).toHaveBeenCalled()
    expect(pipeline).toHaveBeenCalled()

    // Verify S3 client was initialized with correct config
    expect(S3Client).toHaveBeenCalledWith({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET
      }
    })

    // Verify compressed file was read and uploaded
    expect(fsPromises.readFile).toHaveBeenCalledWith(
      expect.stringContaining('languages-backup.sql.gz')
    )
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: 'backups/languages-backup.sql.gz',
      Body: expect.any(Buffer),
      ContentType: 'application/gzip'
    })

    // Verify files were cleaned up
    expect(fsPromises.unlink).toHaveBeenCalledWith(
      expect.stringContaining('languages-backup.sql')
    )
    expect(fsPromises.unlink).toHaveBeenCalledWith(
      expect.stringContaining('languages-backup.sql.gz')
    )

    // Verify logger was used
    expect(mockLogger.info).toHaveBeenCalledWith('Starting database export')
    expect(mockLogger.info).toHaveBeenCalledWith('Compressing file with gzip')
    expect(mockLogger.info).toHaveBeenCalledWith('File compression completed')
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Checking for existing backup file'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'No existing backup file found'
    )
    expect(mockLogger.info).toHaveBeenCalledWith('Uploading to R2')
    expect(mockLogger.info).toHaveBeenCalledWith('Upload to R2 completed')
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Database export, compression, and upload completed successfully'
    )
  })

  it('should create backup of existing file', async () => {
    // Mock HeadObjectCommand to indicate file exists
    const mockSend = jest.fn().mockImplementation((command) => {
      if (command.constructor.name === 'HeadObjectCommand') {
        return {} // File exists
      }
      return {}
    })
    ;(S3Client as jest.Mock).mockImplementation(() => ({
      send: mockSend
    }))

    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await service(mockLogger)

    // Verify backup was created
    expect(CopyObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      CopySource: `${process.env.CLOUDFLARE_R2_BUCKET}/backups/languages-backup.sql.gz`,
      Key: 'backups/languages-backup.sql.gz.bak'
    })

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Creating backup of existing file'
    )
    expect(mockLogger.info).toHaveBeenCalledWith('Backup created successfully')
  })

  it('should throw an error if database URL is not set', async () => {
    delete process.env.PG_DATABASE_URL_LANGUAGES

    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await expect(service(mockLogger)).rejects.toThrow()
  })

  it('should throw an error if R2 credentials are not set', async () => {
    delete process.env.CLOUDFLARE_R2_ENDPOINT
    delete process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
    delete process.env.CLOUDFLARE_R2_SECRET

    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await expect(service(mockLogger)).rejects.toThrow(
      'Missing CLOUDFLARE_R2_ENDPOINT'
    )
  })

  it('should throw an error if R2 bucket is not set', async () => {
    delete process.env.CLOUDFLARE_R2_BUCKET

    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await expect(service(mockLogger)).rejects.toThrow(
      'Missing CLOUDFLARE_R2_BUCKET'
    )
  })
})
