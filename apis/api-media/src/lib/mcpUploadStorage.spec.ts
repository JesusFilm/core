import {
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand
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
beforeEach(() => send.mockReset())
describe('private encrypted staging adapter', () => {
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
