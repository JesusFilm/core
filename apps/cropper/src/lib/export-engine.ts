import type { CropPath, ExportPreset, Video } from '../types'

interface ExportCallbacks {
  onProgress?: (progress: number, etaSeconds: number) => void
  onComplete?: (downloadUrl: string) => void
  onError?: (error: string) => void
}

export class ExportWorkerController {
  private timeoutId?: NodeJS.Timeout

  start(video: Video, preset: ExportPreset, _path: CropPath, callbacks: ExportCallbacks) {
    if (typeof window === 'undefined') {
      return
    }

    this.stop()

    // Simulate export progress
    let progress = 0
    const totalDuration = 3000 // 3 seconds simulation

    const updateProgress = () => {
      progress += Math.random() * 15 // Random progress increment
      if (progress >= 100) {
        progress = 100
      }

      callbacks.onProgress?.(progress, Math.max(0, (100 - progress) * 0.1))

      if (progress < 100) {
        this.timeoutId = setTimeout(updateProgress, 200 + Math.random() * 300)
      } else {
        // Export complete - create a blob and download it
        this.createAndDownloadFile(video, preset)
          .then((downloadUrl) => {
            callbacks.onComplete?.(downloadUrl)
          })
          .catch((error) => {
            callbacks.onError?.(error.message)
          })
      }
    }

    // Start the progress simulation
    updateProgress()
  }

  private async createAndDownloadFile(video: Video, preset: ExportPreset): Promise<string> {
    // Create a sample video file content (in a real implementation, this would be the actual processed video)
    const fileName = `${video.slug}_${preset.id}_${Date.now()}.${preset.format}`

    // Create a simple text file with metadata (in production, this would be the actual video file)
    const metadata = {
      originalVideo: video.title,
      exportPreset: preset.name,
      dimensions: `${preset.width}x${preset.height}`,
      format: preset.format,
      fps: preset.fps,
      bitrate: preset.bitrate,
      exportedAt: new Date().toISOString(),
      note: 'This is a demo export. In production, this would be the actual cropped video file.'
    }

    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Clean up the URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000)

    return `Downloaded: ${fileName}`
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  dispose() {
    this.stop()
  }
}

export function runExport(
  video: Video,
  preset: ExportPreset,
  path: CropPath,
  callbacks: ExportCallbacks
): () => void {
  const controller = new ExportWorkerController()
  controller.start(video, preset, path, callbacks)
  return () => controller.dispose()
}
