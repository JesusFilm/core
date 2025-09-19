import {
  cropKeyframeSchema,
  cropPathSchema,
  exportRequestSchema,
  exportPresetSchema,
  videoSchema
} from '../lib/validation'

const baseVideo = {
  slug: 'sample-video',
  title: 'Sample',
  description: 'Demo',
  duration: 60,
  width: 1920,
  height: 1080,
  fps: 30,
  src: 'https://example.com/video.mp4',
  poster: 'https://example.com/poster.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['demo']
}

const baseKeyframe = {
  id: 'kf_1',
  time: 1,
  window: { focusX: 0.5, focusY: 0.5, scale: 1 },
  easing: 'linear' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

describe('validation schemas', () => {
  it('validates a video entity', () => {
    expect(() => videoSchema.parse(baseVideo)).not.toThrow()
  })

  it('rejects invalid video payloads', () => {
    expect(() => videoSchema.parse({ ...baseVideo, width: -10 })).toThrow()
  })

  it('validates crop keyframes and paths', () => {
    const keyframe = cropKeyframeSchema.parse(baseKeyframe)

    expect(keyframe.window.focusX).toBeCloseTo(0.5)

    const path = cropPathSchema.parse({
      id: 'path_1',
      videoSlug: baseVideo.slug,
      aspectRatio: 9 / 16,
      padding: 0.05,
      smoothing: 0.25,
      keyframes: [keyframe],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    expect(path.keyframes).toHaveLength(1)
  })

  it('validates export requests', () => {
    const preset = exportPresetSchema.parse({
      id: 'preset',
      name: '1080x1920',
      description: 'Vertical preset',
      width: 1080,
      height: 1920,
      fps: 30,
      bitrate: 8_000_000,
      format: 'mp4'
    })

    expect(preset.format).toBe('mp4')

    expect(() =>
      exportRequestSchema.parse({
        presetId: preset.id,
        path: {
          id: 'path_1',
          videoSlug: baseVideo.slug,
          aspectRatio: 9 / 16,
          padding: 0.05,
          smoothing: 0.25,
          keyframes: [baseKeyframe],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    ).not.toThrow()
  })
})
