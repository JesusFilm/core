import { mediaStartInput } from './mediaJobContract'

describe('immutable upload manifests', () => {
  it('admits exactly one decimal gigabyte of video and rejects overflow or a mismatched kind', () => {
    const input = {
      journeyId: 'draft',
      idempotencyKey: 'one-video',
      kind: 'video_upload',
      file: {
        name: 'synthetic.mp4',
        mime: 'video/mp4',
        size: 1_000_000_000,
        sha256: 'a'.repeat(64)
      }
    }
    expect(mediaStartInput.safeParse(input).success).toBe(true)
    expect(
      mediaStartInput.safeParse({
        ...input,
        file: { ...input.file, size: 1_000_000_001 }
      }).success
    ).toBe(false)
    expect(
      mediaStartInput.safeParse({ ...input, kind: 'image_upload' }).success
    ).toBe(false)
  })
})
