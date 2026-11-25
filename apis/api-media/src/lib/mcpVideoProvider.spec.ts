import { createHmac, randomUUID } from 'node:crypto'

import { imageHash } from './mcpImageInput'
import { validateVideoInput } from './mcpVideoInput'
import { muxCallbackJob } from './mcpVideoProvider'

describe('video provider authentication and input', () => {
  it('authenticates the exact callback bytes and tolerates signature rotation without trusting raw URLs', () => {
    const id = randomUUID()
    const secret = 'server-only-secret'
    const raw = JSON.stringify({
      type: 'video.asset.ready',
      data: { passthrough: id }
    })
    const signature = createHmac('sha256', secret)
      .update(`1000.${raw}`)
      .digest('hex')
    expect(
      muxCallbackJob(raw, `t=1000,v1=bad,v1=${signature}`, secret, 1000000)
    ).toBe(id)
    expect(() =>
      muxCallbackJob(raw + ' ', `t=1000,v1=${signature}`, secret, 1000000)
    ).toThrow()
    expect(() =>
      muxCallbackJob(raw, `t=1000,v1=${signature}`, secret, 1301000)
    ).toThrow()
    expect(() =>
      muxCallbackJob(raw, `t=1000,t=1000,v1=${signature}`, secret, 1000000)
    ).toThrow()
  })

  it.each(['video/mp4', 'video/quicktime'] as const)(
    'validates immutable streamed %s input and rejects spoofed content, sizes and hashes',
    async (mime) => {
      const bytes = Buffer.alloc(128)
      bytes.writeUInt32BE(24)
      bytes.write(mime === 'video/mp4' ? 'ftypisom' : 'ftypqt  ', 4)
      const file = {
        name: mime === 'video/mp4' ? 'one.mp4' : 'one.mov',
        mime,
        size: bytes.length,
        sha256: imageHash(bytes)
      }
      async function* input() {
        yield bytes.subarray(0, 7)
        yield bytes.subarray(7)
      }
      await expect(validateVideoInput(input(), file)).resolves.toBeUndefined()
      await expect(
        validateVideoInput(input(), { ...file, size: 127 })
      ).rejects.toThrow()
      await expect(
        validateVideoInput(input(), { ...file, sha256: 'a'.repeat(64) })
      ).rejects.toThrow()
      bytes.write('xxxx', 4)
      await expect(
        validateVideoInput(input(), { ...file, sha256: imageHash(bytes) })
      ).rejects.toThrow()
    }
  )
})
