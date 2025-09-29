'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { DetectionResult, SceneChangeResult } from '../types'
import type { VirtualCameraKeyframe } from '@core/shared/video-processing'

interface DebugOverlayProps {
  /** Video element to overlay on */
  videoElement: HTMLVideoElement | null
  /** Current detection results */
  detectionResults?: DetectionResult[]
  /** Current scene change results */
  sceneChanges?: SceneChangeResult[]
  /** Current virtual camera keyframe */
  currentKeyframe?: VirtualCameraKeyframe
  /** Virtual camera parameters for dead-zone display */
  cameraParams?: {
    deadZoneWidth: number
    deadZoneHeight: number
  }
  /** Whether to show debug overlay */
  enabled: boolean
  /** Canvas for drawing overlay */
  canvasRef?: React.RefObject<HTMLCanvasElement>
}

export function DebugOverlay({
  videoElement,
  detectionResults = [],
  sceneChanges = [],
  currentKeyframe,
  cameraParams,
  enabled,
  canvasRef
}: DebugOverlayProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvas = canvasRef || internalCanvasRef

  const drawOverlay = useCallback(() => {
    if (!canvas.current || !videoElement || !enabled) return

    const ctx = canvas.current.getContext('2d')
    if (!ctx) return

    const { videoWidth, videoHeight } = videoElement
    const { width: canvasWidth, height: canvasHeight } = canvas.current.getBoundingClientRect()

    // Scale factors to match video display size
    const scaleX = canvasWidth / videoWidth
    const scaleY = canvasHeight / videoHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Draw face detections
    detectionResults.forEach((detection, index) => {
      const { box } = detection
      if (!box) return

      const { x, y, width, height } = box

      // Face bounding box
      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2
      ctx.strokeRect(x * scaleX, y * scaleY, width * scaleX, height * scaleY)

      // Face label
      ctx.fillStyle = '#00ff00'
      ctx.font = '12px monospace'
      ctx.fillText(
        `Face ${index + 1} (${(detection.confidence * 100).toFixed(1)}%)`,
        x * scaleX,
        y * scaleY - 5
      )

      // Face center point
      ctx.fillStyle = '#ff0000'
      ctx.beginPath()
      ctx.arc(
        (x + width / 2) * scaleX,
        (y + height / 2) * scaleY,
        3,
        0,
        2 * Math.PI
      )
      ctx.fill()
    })

    // Draw scene change indicators
    sceneChanges.forEach((scene) => {
      const timePosition = (scene.time / videoElement.duration) * canvasWidth

      ctx.strokeStyle = '#ffaa00'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(timePosition, 0)
      ctx.lineTo(timePosition, canvasHeight)
      ctx.stroke()

      ctx.fillStyle = '#ffaa00'
      ctx.font = '10px monospace'
      ctx.fillText('SCENE', timePosition + 2, 15)
    })

    // Draw current virtual camera crop window
    if (currentKeyframe) {
      const { cx, cy, cw, ch } = currentKeyframe

      // Convert normalized coordinates to pixel coordinates
      const cropX = cx * videoWidth * scaleX
      const cropY = cy * videoHeight * scaleY
      const cropWidth = cw * videoWidth * scaleX
      const cropHeight = ch * videoHeight * scaleY

      // Crop window
      ctx.strokeStyle = '#0088ff'
      ctx.lineWidth = 3
      ctx.strokeRect(cropX, cropY, cropWidth, cropHeight)

      // Crop window label
      ctx.fillStyle = '#0088ff'
      ctx.font = '12px monospace'
      ctx.fillText(
        `Crop (${(cw * 100).toFixed(1)}% × ${(ch * 100).toFixed(1)}%)`,
        cropX,
        cropY - 5
      )
    }

    // Draw dead-zone
    if (currentKeyframe && cameraParams) {
      const { cx, cy } = currentKeyframe
      const { deadZoneWidth, deadZoneHeight } = cameraParams

      const deadZoneX = (cx - deadZoneWidth / 2) * videoWidth * scaleX
      const deadZoneY = (cy - deadZoneHeight / 2) * videoHeight * scaleY
      const deadZoneW = deadZoneWidth * videoWidth * scaleX
      const deadZoneH = deadZoneHeight * videoHeight * scaleY

      ctx.strokeStyle = '#ff0088'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.strokeRect(deadZoneX, deadZoneY, deadZoneW, deadZoneH)
      ctx.setLineDash([])

      ctx.fillStyle = '#ff0088'
      ctx.font = '10px monospace'
      ctx.fillText('Dead Zone', deadZoneX + 2, deadZoneY + 12)
    }

    // Draw grid for reference
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 1
    ctx.setLineDash([1, 3])

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * canvasWidth
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * canvasHeight
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }, [canvas, videoElement, enabled, detectionResults, sceneChanges, currentKeyframe, cameraParams])

  useEffect(() => {
    if (!enabled) return

    const handleTimeUpdate = () => drawOverlay()
    const handleLoadedData = () => drawOverlay()

    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate)
      videoElement.addEventListener('loadeddata', handleLoadedData)
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate)
        videoElement.removeEventListener('loadeddata', handleLoadedData)
      }
    }
  }, [videoElement, enabled, drawOverlay])

  useEffect(() => {
    drawOverlay()
  }, [drawOverlay])

  if (!enabled) return null

  return (
    <canvas
      ref={canvas}
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }}
    />
  )
}
