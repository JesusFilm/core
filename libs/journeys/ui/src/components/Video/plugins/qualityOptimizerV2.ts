import videojs from 'video.js'
import VideoJsPlayer from '../utils/videoJsTypes'

interface QualityOptimizerOptions {
  maxRetryAttempts?: number
}

interface QualityHistory {
  max: number
  min: number
  mode: number | null
}

const Plugin = videojs.getPlugin('plugin')

class QualityOptimizer extends Plugin {
  private segmentMap: Map<number, number> = new Map()
  private maxQuality: number | null = null
  private minQuality: number | null = null
  private retryAttempts = 0
  private readonly maxRetryAttempts: number

  private qualityHistory: QualityHistory[] = []

  constructor(player: VideoJsPlayer, options?: QualityOptimizerOptions) {
    super(player)
    this.maxRetryAttempts = options?.maxRetryAttempts ?? 3
    this.setupListeners()

    this.player.qualityLevels()
  }

  private setupSegmentMetadataListeners(segmentMetadataTrack: any): void {
    segmentMetadataTrack.on('cuechange', () => {
      const activeCue = segmentMetadataTrack.activeCues[0]
      if (activeCue != null) {
        const value = activeCue.value

        this.segmentMap.set(
          value.resolution.width,
          (this.segmentMap.get(value.resolution.width) ?? 0) + 1
        )

        if (
          this.maxQuality == null ||
          value.resolution.width > this.maxQuality
        ) {
          this.maxQuality = value.resolution.width
        } else if (
          this.minQuality == null ||
          value.resolution.width < this.minQuality
        ) {
          this.minQuality = value.resolution.width
        }

        const segment = {
          start: value.start,
          end: value.end,
          bandwidth: value.bandwidth,
          width: value.resolution.width,
          height: value.resolution.height
        }
        console.log('segment', segment)
      }
    })
  }

  private setupListeners(): void {
    this.player.on('ready', () => {
      const tech = this.player.tech()
      const pc = tech.vhs.playlistController_
      const segmentMetadataTrack = pc.segmentMetadataTrack_

      if (segmentMetadataTrack == null) {
        this.player.on('addtrack', (e) => {
          if (e.track.label === 'segment-metadata') {
            this.setupSegmentMetadataListeners(e.track)
          }
        })
      } else {
        this.setupSegmentMetadataListeners(segmentMetadataTrack)
      }
    })

    this.player.on('ended', async () => {
      console.log('ended')
      const tech = this.player.tech()
      const pc = tech.vhs.playlistController_
      const sl = pc.mainSegmentLoader_

      const qualityLevels = this.player.qualityLevels()

      if (this.retryAttempts < this.maxRetryAttempts) {
        this.retryAttempts++

        let mode: number | null = null
        let maxFrequency = 0

        // Find the most frequent quality level(s), preferring higher quality if tied
        for (const [quality, count] of this.segmentMap) {
          if (count > maxFrequency) {
            maxFrequency = count
            mode = quality
          } else if (count === maxFrequency && quality > (mode ?? 0)) {
            mode = quality
          }
        }

        this.qualityHistory.push({
          max: this.maxQuality ?? 0,
          min: this.minQuality ?? 0,
          mode: mode
        })

        sl.remove(0, Infinity, () => console.log('removed video buffer'))

        if (this.retryAttempts === this.maxRetryAttempts) {
          const historyModes = this.qualityHistory
            .map((q) => q.mode)
            .filter((m) => m != null)

          const f = new Map<number, number>()
          let maxF = 0

          historyModes.forEach((m) => {
            const current = f.get(m) ?? 0
            const newCount = current + 1
            f.set(m, newCount)
            maxF = Math.max(maxF, newCount)
          })

          const modes = Array.from(f.entries())
            .filter(([_, count]) => count === maxF)
            .map(([quality]) => quality)

          const historyMode = modes.length > 1 ? Math.max(...modes) : modes[0]

          Array.from({ length: qualityLevels.length }).forEach((_, i) => {
            qualityLevels[i].enabled = qualityLevels[i].width === historyMode
            console.log('locking quality to: ', historyMode)
          })
        }

        pc.load()
      }
      this.segmentMap.clear()
      this.maxQuality = null

      this.player.currentTime(0)
      await this.player.play()
    })
  }
}

videojs.registerPlugin('qualityOptimizer', QualityOptimizer)

declare module 'video.js' {
  interface VideoJsPlayer {
    qualityOptimizer: QualityOptimizer
  }
}
