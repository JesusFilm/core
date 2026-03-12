import {
  generateSubtitles,
  improveSubtitles,
  uploadSubtitles
} from '@mux/ai/primitives'

import { runSubtitlesWorkflow } from '../workflow'

jest.mock(
  '@mux/ai/primitives',
  () => ({
    generateSubtitles: jest.fn(),
    improveSubtitles: jest.fn(),
    uploadSubtitles: jest.fn()
  }),
  { virtual: true }
)

const mockGenerateSubtitles = generateSubtitles as jest.Mock
const mockImproveSubtitles = improveSubtitles as jest.Mock
const mockUploadSubtitles = uploadSubtitles as jest.Mock

describe('subtitles workflow', () => {
  beforeEach(() => {
    mockGenerateSubtitles.mockResolvedValue({
      language: 'en',
      format: 'vtt',
      cues: [{ start: 0, end: 1, text: 'Hello world' }]
    })
    mockImproveSubtitles.mockResolvedValue({
      language: 'en',
      format: 'vtt',
      cues: [{ start: 0, end: 1, text: 'Hello, world.' }]
    })
    mockUploadSubtitles.mockResolvedValue({
      subtitleId: 'subtitle_123',
      url: 'https://example.com/subtitles.vtt'
    })
  })

  it('runs the stages in order and returns the final result', async () => {
    const result = await runSubtitlesWorkflow({
      assetId: 'asset_123',
      playbackId: 'playback_123',
      requestId: 'request_123'
    })

    expect(mockGenerateSubtitles).toHaveBeenCalledTimes(1)
    expect(mockImproveSubtitles).toHaveBeenCalledTimes(1)
    expect(mockUploadSubtitles).toHaveBeenCalledTimes(1)
    expect(result.upload.subtitleId).toBe('subtitle_123')
  })
})
