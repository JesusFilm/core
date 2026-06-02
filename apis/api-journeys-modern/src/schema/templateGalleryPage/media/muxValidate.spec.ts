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

  it('returns muxVideoId + denormalized playbackId for a ready video', async () => {
    mockQuery.mockResolvedValue({
      data: { getMuxVideo: { id: 'vid-1', playbackId: 'pb_x' } }
    })

    await expect(muxValidate('vid-1')).resolves.toEqual({
      muxVideoId: 'vid-1',
      muxPlaybackId: 'pb_x'
    })
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { id: 'vid-1' } })
    )
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
