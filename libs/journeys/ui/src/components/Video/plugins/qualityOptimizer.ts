import videojs from 'video.js'
import VideoJsPlayer from '../utils/videoJsTypes'

interface QualityOptimizerOptions {
  maxRetryAttempts?: number
}

const Plugin = videojs.getPlugin('plugin')

class QualityOptimizer extends Plugin {
  private segmentArray: Array<{
    start: number
    end: number
    bandwidth: number
    width: number
    height: number
  }> = []
  private retryAttempts = 0
  private readonly maxRetryAttempts: number

  constructor(player: VideoJsPlayer, options?: QualityOptimizerOptions) {
    super(player)
    this.maxRetryAttempts = options?.maxRetryAttempts ?? 3
    this.setupListeners()
  }

  private setupSegmentMetadataListeners(segmentMetadataTrack: any): void {
    segmentMetadataTrack.on('cuechange', () => {
      const activeCue = segmentMetadataTrack.activeCues[0]
      if (activeCue != null) {
        const value = activeCue.value
        const segment = {
          start: value.start,
          end: value.end,
          bandwidth: value.bandwidth,
          width: value.resolution.width,
          height: value.resolution.height
        }
        console.log('segment', segment)
        this.segmentArray.push(segment)
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

      if (this.retryAttempts < this.maxRetryAttempts) {
        sl.remove(0, Infinity, () => {
          console.log('removed video buffer')
        })

        this.retryAttempts++
        console.log(
          `Retry attempt ${this.retryAttempts} of ${this.maxRetryAttempts}`
        )

        pc.load()
      } else {
        console.log('Max retry attempts reached, keeping current quality')
      }

      this.segmentArray = []

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
