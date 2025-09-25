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

// Scene change adaptation logic
export function adaptCropPathToSceneChange(
  path: CropPath,
  sceneChange: import('../types').SceneChangeResult,
  allSceneChanges: import('../types').SceneChangeResult[]
): CropPath {
  const { level, changePercentage, time, motionVectors } = sceneChange

  // Different adaptation strategies based on scene change level
  switch (level) {
    case 'stable':
      // Low activity - continue normal tracking
      return path

    case 'moderate':
      // Moderate activity - adjust tracking sensitivity
      if (changePercentage > 25) {
        // Create a new keyframe to handle the change
        const newKeyframe = createCropKeyframe(time, {
          focusX: 0.5, // Reset to center
          focusY: 0.5,
          scale: 1.2 // Slightly wider crop for moderate changes
        })

        return setKeyframes(path, [...path.keyframes, newKeyframe])
      }
      return path

    case 'significant': {
      // Significant changes - pause auto-tracking temporarily
      // Add a keyframe with wider crop area
      const significantKeyframe = createCropKeyframe(time, {
        focusX: 0.5,
        focusY: 0.5,
        scale: 1.5 // Much wider crop for significant changes
      })

      return setKeyframes(path, [...path.keyframes, significantKeyframe])
    }

    case 'transition': {
      // Scene transition - reset crop window and create new keyframe
      // Find the previous scene change to determine transition type
      const previousSceneChange = allSceneChanges
        .filter((sc) => sc.time < time)
        .sort((a, b) => b.time - a.time)[0]

      let transitionKeyframe: CropKeyframe

      if (motionVectors?.isCameraMovement) {
        // Camera movement - keep current crop area but adjust focus
        transitionKeyframe = createCropKeyframe(time, {
          focusX: 0.5,
          focusY: 0.5,
          scale: 1.3 // Moderate crop for camera movement
        })
      } else {
        // Subject movement or scene cut - reset to default
        transitionKeyframe = createCropKeyframe(time, {
          focusX: 0.5,
          focusY: 0.5,
          scale: 1.0 // Default crop scale
        })
      }

      const cleanupWindowSeconds = 0.75
      const cleanupStart = Math.max(
        0,
        previousSceneChange ? Math.max(previousSceneChange.time, time - cleanupWindowSeconds) : time - cleanupWindowSeconds
      )
      const cleanupEnd = time + cleanupWindowSeconds

      const lastKeyframeBeforeTransition = path.keyframes
        .filter((keyframe) => keyframe.time < time)
        .sort((a, b) => b.time - a.time)[0]

      const preservedKeyframes = path.keyframes.filter((keyframe) => {
        if (keyframe.id === lastKeyframeBeforeTransition?.id) {
          return true
        }

        if (keyframe.locked) {
          return true
        }

        if (keyframe.time < cleanupStart) {
          return true
        }

        if (keyframe.time > cleanupEnd) {
          return true
        }

        return false
      })

      const dedupedKeyframes = preservedKeyframes.filter(
        (keyframe) => Math.abs(keyframe.time - time) > 1e-3
      )

      return setKeyframes(path, [...dedupedKeyframes, transitionKeyframe])
    }

    default:
      return path
  }
}

// Helper function to determine if scene change requires immediate attention
export function shouldAdaptToSceneChange(sceneChange: import('../types').SceneChangeResult): boolean {
  const { level, changePercentage } = sceneChange

  switch (level) {
    case 'stable':
      return false // No adaptation needed
    case 'moderate':
      return changePercentage > 20 // Only adapt for moderate changes above threshold
    case 'significant':
    case 'transition':
      return true // Always adapt for significant changes and transitions
    default:
      return false
  }
}

// Helper function to get recommended crop settings for scene change
export function getRecommendedCropForSceneChange(
  sceneChange: import('../types').SceneChangeResult,
  currentCrop?: CropWindow
): Partial<CropWindow> {
  const { level, motionVectors } = sceneChange

  const baseSettings = {
    focusX: 0.5,
    focusY: 0.5,
    scale: 1.0
  }

  switch (level) {
    case 'moderate':
      return {
        ...baseSettings,
        scale: currentCrop?.scale ? Math.min(currentCrop.scale * 1.1, 1.3) : 1.1
      }

    case 'significant':
      return {
        ...baseSettings,
        scale: currentCrop?.scale ? Math.min(currentCrop.scale * 1.2, 1.5) : 1.3
      }

    case 'transition':
      if (motionVectors?.isCameraMovement) {
        return {
          ...baseSettings,
          scale: 1.2 // Moderate adjustment for camera movement
        }
      } else {
        return baseSettings // Reset to center for scene changes
      }

    default:
      return baseSettings
  }
}
