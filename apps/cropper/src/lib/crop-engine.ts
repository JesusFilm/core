import { nanoid } from 'nanoid'
import type { CropBox, CropKeyframe, CropPath, CropWindow, DetectionResult, Video } from '../types'

const DEFAULT_ASPECT_RATIO = 9 / 16
const MIN_SCALE = 0.2
const MAX_SCALE = 1.25

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const timestamp = () => new Date().toISOString()

function ensureScale(scale: number) {
  return clamp(scale, MIN_SCALE, MAX_SCALE)
}

function ensureFocus(value: number) {
  return clamp(value, 0, 1)
}

export function createCropKeyframe(time: number, window: Partial<CropWindow> = {}): CropKeyframe {
  const now = timestamp()
  return {
    id: nanoid(12),
    time,
    window: {
      focusX: ensureFocus(window.focusX ?? 0.5),
      focusY: ensureFocus(window.focusY ?? 0.5),
      scale: ensureScale(window.scale ?? 1)
    },
    easing: 'linear',
    locked: window.scale !== undefined && window.scale < MIN_SCALE,
    createdAt: now,
    updatedAt: now
  }
}

export function createInitialPath(video: Video): CropPath {
  const start = createCropKeyframe(0)
  const end = createCropKeyframe(video.duration)

  return {
    id: nanoid(12),
    videoSlug: video.slug,
    aspectRatio: DEFAULT_ASPECT_RATIO,
    padding: 0.05,
    smoothing: 0.25,
    keyframes: [start, end],
    createdAt: timestamp(),
    updatedAt: timestamp()
  }
}

export function updateKeyframe(keyframe: CropKeyframe, patch: Partial<CropKeyframe>): CropKeyframe {
  return {
    ...keyframe,
    ...patch,
    window: {
      focusX: ensureFocus(patch.window?.focusX ?? keyframe.window.focusX),
      focusY: ensureFocus(patch.window?.focusY ?? keyframe.window.focusY),
      scale: ensureScale(patch.window?.scale ?? keyframe.window.scale)
    },
    easing: patch.easing ?? keyframe.easing,
    locked: patch.locked ?? keyframe.locked,
    time: clamp(patch.time ?? keyframe.time, 0, Number.MAX_SAFE_INTEGER),
    updatedAt: timestamp()
  }
}

export function toCropBox(
  keyframe: CropKeyframe,
  video: Video,
  aspectRatio: number = DEFAULT_ASPECT_RATIO,
  padding = 0
): CropBox {
  const videoAspect = video.width / video.height
  const height = ensureScale(keyframe.window.scale)
  const width = height * (aspectRatio / videoAspect)

  const paddedWidth = clamp(width + padding * width, 0.1, 1)
  const paddedHeight = clamp(height + padding * height, 0.1, 1)

  const left = clamp(keyframe.window.focusX - paddedWidth / 2, 0, 1 - paddedWidth)
  const top = clamp(keyframe.window.focusY - paddedHeight / 2, 0, 1 - paddedHeight)

  return {
    x: Number(left.toFixed(4)),
    y: Number(top.toFixed(4)),
    width: Number(paddedWidth.toFixed(4)),
    height: Number(paddedHeight.toFixed(4))
  }
}

export function sortKeyframes(keyframes: CropKeyframe[]): CropKeyframe[] {
  return [...keyframes].sort((a, b) => a.time - b.time)
}

export function mergeDetectionsIntoPath(
  detections: DetectionResult[],
  path: CropPath
): CropPath {
  if (detections.length === 0) {
    return path
  }

  const detectionKeyframes = detections.map((detection) =>
    createCropKeyframe(detection.time, {
      focusX: detection.box.x + detection.box.width / 2,
      focusY: detection.box.y + detection.box.height / 2,
      scale: detection.box.height * 1.15
    })
  )

  const merged = sortKeyframes([...path.keyframes, ...detectionKeyframes])

  return {
    ...path,
    keyframes: merged,
    updatedAt: timestamp()
  }
}

export function deleteKeyframe(path: CropPath, keyframeId: string): CropPath {
  return {
    ...path,
    keyframes: path.keyframes.filter((keyframe) => keyframe.id !== keyframeId),
    updatedAt: timestamp()
  }
}

export function replaceKeyframe(path: CropPath, keyframe: CropKeyframe): CropPath {
  const next = path.keyframes.map((existing) => (existing.id === keyframe.id ? keyframe : existing))
  return {
    ...path,
    keyframes: sortKeyframes(next),
    updatedAt: timestamp()
  }
}

export function setKeyframes(path: CropPath, keyframes: CropKeyframe[]): CropPath {
  return {
    ...path,
    keyframes: sortKeyframes(keyframes),
    updatedAt: timestamp()
  }
}

export function cropBoxAtTime(
  path: CropPath,
  video: Video,
  time: number,
  interpolator: (frames: CropKeyframe[], time: number) => CropKeyframe
): CropBox {
  const resolved = interpolator(sortKeyframes(path.keyframes), time)
  return toCropBox(resolved, video, path.aspectRatio, path.padding)
}
