import { type MockedFunction } from 'vitest'

import { linkValidate } from './linkValidate'
import { muxValidate } from './muxValidate'
import { resolveMediaInput } from './resolveMediaInput'

vi.mock('./linkValidate', () => ({ linkValidate: vi.fn() }))
vi.mock('./muxValidate', () => ({ muxValidate: vi.fn() }))

const mockLinkValidate = linkValidate as MockedFunction<typeof linkValidate>
const mockMuxValidate = muxValidate as MockedFunction<typeof muxValidate>

describe('resolveMediaInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null for null and undefined (no validation, no IO)', async () => {
    expect(await resolveMediaInput(null)).toBeNull()
    expect(await resolveMediaInput(undefined)).toBeNull()
    expect(mockLinkValidate).not.toHaveBeenCalled()
    expect(mockMuxValidate).not.toHaveBeenCalled()
  })

  it('dispatches a link input to linkValidate and composes the row', async () => {
    mockLinkValidate.mockResolvedValue({ embedUrl: 'https://embed' })
    expect(await resolveMediaInput({ type: 'link', url: 'https://x' })).toEqual(
      {
        type: 'link',
        embedUrl: 'https://embed',
        muxVideoId: null,
        muxPlaybackId: null,
        muxName: null,
        muxDuration: null
      }
    )
    expect(mockLinkValidate).toHaveBeenCalledWith('https://x')
  })

  it('dispatches a mux input to muxValidate and composes the row', async () => {
    mockMuxValidate.mockResolvedValue({
      muxVideoId: 'v',
      muxPlaybackId: 'pb',
      muxName: 'My clip',
      muxDuration: 125
    })
    expect(await resolveMediaInput({ type: 'mux', muxVideoId: 'v' })).toEqual({
      type: 'mux',
      embedUrl: null,
      muxVideoId: 'v',
      muxPlaybackId: 'pb',
      muxName: 'My clip',
      muxDuration: 125
    })
    expect(mockMuxValidate).toHaveBeenCalledWith('v')
  })

  it.each([
    [
      'link with a muxVideoId',
      { type: 'link', url: 'https://x', muxVideoId: 'v' }
    ],
    ['mux with a url', { type: 'mux', muxVideoId: 'v', url: 'https://x' }],
    ['link with no url', { type: 'link' }],
    ['unknown type', { type: 'pdf', url: 'https://x' }]
  ])('throws MEDIA_INPUT_SHAPE_MISMATCH for %s', async (_label, media) => {
    await expect(resolveMediaInput(media)).rejects.toMatchObject({
      extensions: {
        code: 'BAD_USER_INPUT',
        reason: 'MEDIA_INPUT_SHAPE_MISMATCH'
      }
    })
    expect(mockLinkValidate).not.toHaveBeenCalled()
    expect(mockMuxValidate).not.toHaveBeenCalled()
  })
})
