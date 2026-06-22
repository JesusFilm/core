import { muxValidate } from './muxValidate'

// Mock @apollo/client used to read Mux through the gateway — mirrors the
// fetchFieldsFromMux test in block/video/service.spec.ts.
const mockQuery = vi.fn()
vi.mock('@apollo/client', () => ({
  ApolloClient: vi.fn().mockImplementation(() => ({ query: mockQuery })),
  InMemoryCache: vi.fn(),
  createHttpLink: vi.fn()
}))

describe('muxValidate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns muxVideoId + denormalized playbackId, name and duration for a ready video', async () => {
    mockQuery.mockResolvedValue({
      data: {
        getMuxVideo: {
          id: 'vid-1',
          playbackId: 'pb_x',
          name: 'My clip',
          duration: 125
        }
      }
    })

    await expect(muxValidate('vid-1')).resolves.toEqual({
      muxVideoId: 'vid-1',
      muxPlaybackId: 'pb_x',
      muxName: 'My clip',
      muxDuration: 125
    })
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { id: 'vid-1' } })
    )
  })

  it('returns null name/duration when Mux reports none', async () => {
    mockQuery.mockResolvedValue({
      data: {
        getMuxVideo: {
          id: 'vid-1',
          playbackId: 'pb_x',
          name: null,
          duration: null
        }
      }
    })

    await expect(muxValidate('vid-1')).resolves.toEqual({
      muxVideoId: 'vid-1',
      muxPlaybackId: 'pb_x',
      muxName: null,
      muxDuration: null
    })
  })

  it('throws NOT_FOUND when the video does not exist', async () => {
    mockQuery.mockResolvedValue({ data: { getMuxVideo: null } })
    await expect(muxValidate('missing')).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND', reason: 'MUX_NOT_FOUND' }
    })
  })

  it('throws MUX_NOT_READY when the video has no playbackId yet', async () => {
    mockQuery.mockResolvedValue({
      data: { getMuxVideo: { id: 'vid-1', playbackId: null } }
    })
    await expect(muxValidate('vid-1')).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT', reason: 'MUX_NOT_READY' }
    })
  })
})
