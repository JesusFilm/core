import { type MockedFunction } from 'vitest'

import { linkValidate } from './linkValidate'
import { muxValidate } from './muxValidate'
import {
  mediaCreateData,
  mediaUpdateData,
  resolveMediaInput
} from './resolveMediaInput'

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

  it('resolves a provided url to the link slot via linkValidate', async () => {
    mockLinkValidate.mockResolvedValue({ embedUrl: 'https://embed' })
    expect(await resolveMediaInput({ type: 'link', url: 'https://x' })).toEqual(
      {
        type: 'link',
        link: { embedUrl: 'https://embed' },
        mux: undefined
      }
    )
    expect(mockLinkValidate).toHaveBeenCalledWith('https://x')
    expect(mockMuxValidate).not.toHaveBeenCalled()
  })

  it('resolves a provided muxVideoId to the mux slot via muxValidate', async () => {
    mockMuxValidate.mockResolvedValue({
      muxVideoId: 'v',
      muxPlaybackId: 'pb',
      muxName: 'My clip',
      muxDuration: 125
    })
    expect(await resolveMediaInput({ type: 'mux', muxVideoId: 'v' })).toEqual({
      type: 'mux',
      link: undefined,
      mux: {
        muxVideoId: 'v',
        muxPlaybackId: 'pb',
        muxName: 'My clip',
        muxDuration: 125
      }
    })
    expect(mockMuxValidate).toHaveBeenCalledWith('v')
  })

  it('resolves both slots at once (both retained)', async () => {
    mockLinkValidate.mockResolvedValue({ embedUrl: 'https://embed' })
    mockMuxValidate.mockResolvedValue({
      muxVideoId: 'v',
      muxPlaybackId: 'pb',
      muxName: null,
      muxDuration: null
    })
    const resolved = await resolveMediaInput({
      type: 'link',
      url: 'https://x',
      muxVideoId: 'v'
    })
    expect(resolved).toEqual({
      type: 'link',
      link: { embedUrl: 'https://embed' },
      mux: {
        muxVideoId: 'v',
        muxPlaybackId: 'pb',
        muxName: null,
        muxDuration: null
      }
    })
  })

  it('distinguishes omitted (leave) from null (clear) per slot', async () => {
    // url omitted, muxVideoId null → link leave, mux clear
    expect(await resolveMediaInput({ type: 'none', muxVideoId: null })).toEqual(
      { type: 'none', link: undefined, mux: null }
    )
    expect(mockLinkValidate).not.toHaveBeenCalled()
    expect(mockMuxValidate).not.toHaveBeenCalled()
  })

  it('accepts type: none with no payloads', async () => {
    expect(await resolveMediaInput({ type: 'none' })).toEqual({
      type: 'none',
      link: undefined,
      mux: undefined
    })
  })

  it.each([
    ['unknown type', { type: 'pdf', url: 'https://x' }],
    ['missing type', { url: 'https://x' }],
    ['empty url string', { type: 'link', url: '' }]
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

  describe('mediaCreateData', () => {
    it('collapses leave/clear to null on a fresh row', () => {
      expect(
        mediaCreateData({ type: 'none', link: undefined, mux: null })
      ).toEqual({
        type: 'none',
        embedUrl: null,
        muxVideoId: null,
        muxPlaybackId: null,
        muxName: null,
        muxDuration: null
      })
    })

    it('seeds set slots', () => {
      expect(
        mediaCreateData({
          type: 'link',
          link: { embedUrl: 'https://embed' },
          mux: {
            muxVideoId: 'v',
            muxPlaybackId: 'pb',
            muxName: 'n',
            muxDuration: 9
          }
        })
      ).toEqual({
        type: 'link',
        embedUrl: 'https://embed',
        muxVideoId: 'v',
        muxPlaybackId: 'pb',
        muxName: 'n',
        muxDuration: 9
      })
    })
  })

  describe('mediaUpdateData', () => {
    it('always sets type; omits a left slot, clears a null slot, sets a value slot', () => {
      // link cleared, mux left untouched
      expect(
        mediaUpdateData({ type: 'none', link: null, mux: undefined })
      ).toEqual({ type: 'none', embedUrl: null })

      // link left untouched, mux set
      expect(
        mediaUpdateData({
          type: 'mux',
          link: undefined,
          mux: {
            muxVideoId: 'v',
            muxPlaybackId: 'pb',
            muxName: null,
            muxDuration: null
          }
        })
      ).toEqual({
        type: 'mux',
        muxVideoId: 'v',
        muxPlaybackId: 'pb',
        muxName: null,
        muxDuration: null
      })
    })
  })
})
