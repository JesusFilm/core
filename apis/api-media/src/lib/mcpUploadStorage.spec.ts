import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand
} from '@aws-sdk/client-s3'

import { s3UploadStorage } from './mcpUploadStorage'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('@aws-sdk/client-s3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aws-sdk/client-s3')>()
  return {
    ...actual,
    S3Client: vi.fn(function () {
      return { send }
    })
  }
})
const jobId = '12345678-1234-1234-1234-123456789abc'
const key = `${jobId}/0-${'a'.repeat(64)}`

describe('private encrypted staging adapter', () => {
  beforeEach(() => send.mockReset())

  it('writes only server-owned keys with encryption and reads bounded private bytes', async () => {
    send.mockResolvedValueOnce({}).mockResolvedValueOnce({
      ContentLength: 3,
      Body: (async function* () {
        yield Buffer.from('abc')
      })()
    })
    const storage = s3UploadStorage('controlled-private-bucket')
    await storage.put(key, Buffer.from('abc'))
    const put = send.mock.calls[0][0] as PutObjectCommand
    expect(put).toBeInstanceOf(PutObjectCommand)
    expect(put.input).toMatchObject({
      Bucket: 'controlled-private-bucket',
      Key: `mcp-input/${key}`,
      ServerSideEncryption: 'AES256',
      ContentType: 'application/octet-stream'
    })
    expect(await storage.get(key)).toEqual(Buffer.from('abc'))
    expect(send.mock.calls[1][0]).toBeInstanceOf(GetObjectCommand)
    await expect(
      storage.put('../foreign', Buffer.from('abc'))
    ).rejects.toThrow()
  })

  it.each([
    [403, 'AccessDenied', 'rejected'],
    [403, 'InvalidAccessKeyId', 'rejected'],
    [403, 'SignatureDoesNotMatch', 'rejected'],
    [400, 'EntityTooLarge', 'rejected'],
    [413, 'EntityTooLarge', 'unknown'],
    [500, 'InternalError', 'unknown'],
    [403, 'UnexpectedError', 'unknown'],
    [undefined, 'TimeoutError', 'unknown']
  ])(
    'classifies storage rejection %s %s without treating uncertainty as stop evidence',
    async (status, name, outcome) => {
      const error = Object.assign(new Error('controlled storage failure'), {
        name,
        $metadata: { httpStatusCode: status, attempts: 1 }
      })
      send.mockRejectedValueOnce(error)
      const result = s3UploadStorage('controlled-private-bucket').put(
        key,
        Buffer.from('abc')
      )
      if (outcome === 'rejected') await expect(result).resolves.toBe('rejected')
      else await expect(result).rejects.toBe(error)
    }
  )

  it.each([undefined, 2])(
    'keeps rejection with %s send attempts uncertain',
    async (attempts) => {
      send.mockRejectedValueOnce(
        Object.assign(new Error('uncertain earlier send'), {
          name: 'AccessDenied',
          $metadata: { httpStatusCode: 403, attempts }
        })
      )
      await expect(
        s3UploadStorage('controlled-private-bucket').put(
          key,
          Buffer.from('abc')
        )
      ).rejects.toThrow('uncertain earlier send')
    }
  )

  it('rejects unknown, oversized and unexpectedly growing objects', async () => {
    const storage = s3UploadStorage('controlled-private-bucket')
    send.mockResolvedValueOnce({ ContentLength: 10000001, Body: {} })
    await expect(storage.get(key)).rejects.toThrow()
    send.mockResolvedValueOnce({
      ContentLength: 1,
      Body: (async function* () {
        yield Buffer.alloc(10000001)
      })()
    })
    await expect(storage.get(key)).rejects.toThrow()
    send.mockRejectedValueOnce(new Error('controlled unknown GET'))
    await expect(storage.get(key)).rejects.toThrow()
  })

  it('deletes only a stopped job prefix, follows pages and leaves failed cleanup unresolved', async () => {
    send
      .mockResolvedValueOnce({
        Contents: [{ Key: `mcp-input/${key}` }],
        NextContinuationToken: 'next'
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ Contents: [] })
    const storage = s3UploadStorage('controlled-private-bucket')
    await storage.removeJob(jobId)
    expect(send.mock.calls[0][0]).toBeInstanceOf(ListObjectsV2Command)
    expect(send.mock.calls[0][0].input).toMatchObject({
      Prefix: `mcp-input/${jobId}/`
    })
    expect(send.mock.calls[1][0]).toBeInstanceOf(DeleteObjectsCommand)
    expect(send.mock.calls[2][0].input).toMatchObject({
      ContinuationToken: 'next'
    })
    send
      .mockResolvedValueOnce({ Contents: [{ Key: `mcp-input/${key}` }] })
      .mockResolvedValueOnce({ Errors: [{ Code: 'AccessDenied' }] })
    await expect(storage.removeJob(jobId)).rejects.toThrow('incomplete')
    await expect(storage.removeJob('../foreign')).rejects.toThrow()
  })
})
