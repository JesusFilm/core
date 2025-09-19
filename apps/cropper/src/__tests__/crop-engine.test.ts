import {
  createCropKeyframe,
  createInitialPath,
  mergeDetectionsIntoPath,
  toCropBox
} from '../lib/crop-engine'
import type { DetectionResult, Video } from '../types'

const video: Video = {
  slug: 'demo',
  title: 'Demo',
  duration: 30,
  width: 1920,
  height: 1080,
  fps: 30,
  src: 'https://example.com/video.mp4',
  poster: 'https://example.com/poster.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: []
}

describe('crop engine', () => {
  it('creates default path with two keyframes', () => {
    const path = createInitialPath(video)
    expect(path.keyframes).toHaveLength(2)
    expect(path.videoSlug).toBe(video.slug)
  })

  it('converts keyframes to crop boxes with 9:16 ratio', () => {
    const keyframe = createCropKeyframe(0, { focusX: 0.5, focusY: 0.5, scale: 1 })
    const crop = toCropBox(keyframe, video)
    const ratio = Number((crop.width / crop.height).toFixed(2))

    expect(ratio).toBeCloseTo(0.32, 2)
    expect(crop.x).toBeGreaterThanOrEqual(0)
    expect(crop.y).toBeGreaterThanOrEqual(0)
  })

  it('merges detections into keyframe path', () => {
    const path = createInitialPath(video)
    const detections: DetectionResult[] = [
      {
        id: 'det-1',
        time: 5,
        box: { x: 0.3, y: 0.2, width: 0.25, height: 0.5 },
        confidence: 0.9,
        label: 'person',
        source: 'mediapipe'
      }
    ]

    const merged = mergeDetectionsIntoPath(detections, path)
    expect(merged.keyframes.length).toBeGreaterThan(path.keyframes.length)
  })
})
