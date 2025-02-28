import { ReactElement, useCallback, useEffect, useState } from 'react'
import Player from 'video.js/dist/types/player'
import Tech from 'video.js/dist/types/tech/tech'
import 'videojs-contrib-quality-levels'

import { SettingsMenu } from '../SettingsMenu'

import { QualityLevel, QualityLevelList, QualityOption } from './types'

interface QualitySelectorProps {
  player: Player
  isMobile: boolean
}

interface HLSTech extends Tech {
  hls: {
    playlists: {
      media_?: {
        segments: Array<{
          buffer?: ArrayBuffer
        }>
        reload: () => void
      }
      media: (playlist: any) => void
      selectPlaylist: () => any
    }
    resetMediaKeys_: () => void
    selectPlaylist: () => any
    representations: () => {
      length: number
      [index: number]: {
        height: number
        id: string
        enabled: boolean
      }
    }
  }
}

export function QualitySelector({
  player,
  isMobile
}: QualitySelectorProps): ReactElement {
  const [qualities, setQualities] = useState<QualityOption[]>([])
  const [currentQuality, setCurrentQuality] = useState<string>('Auto')
  const [autoMode, setAutoMode] = useState(true)
  const [loading, setLoading] = useState(false)

  const updateQualityLevels = useCallback(
    (qualityLevels: QualityLevelList): void => {
      const uniqueLevels = new Map<number, QualityOption>()

      // First pass: collect all qualities, keeping the highest bitrate for each height
      for (let i = 0; i < qualityLevels.length; i++) {
        const quality = qualityLevels[i]
        const existingQuality = uniqueLevels.get(quality.height)

        if (!existingQuality || quality.bitrate > existingQuality.bitrate) {
          uniqueLevels.set(quality.height, {
            height: quality.height,
            bitrate: quality.bitrate,
            label: `${quality.height}p`,
            selected: quality.enabled
          })
        }
      }

      // Convert to array and sort by height descending
      const levels = Array.from(uniqueLevels.values())
      levels.sort((a, b) => b.height - a.height)
      setQualities(levels)

      // Set initial selected quality
      if (qualityLevels.selectedIndex !== -1) {
        const selectedQuality = qualityLevels[qualityLevels.selectedIndex]
        if (selectedQuality) {
          setCurrentQuality(`${selectedQuality.height}p`)
        }
      }
    },
    []
  )

  const handleQualityChange = useCallback(
    (height: number | 'auto'): void => {
      // Store current playback state
      const currentTime = player.currentTime()
      const wasPlaying = !player.paused()
      const currentSource = player.currentSource()

      // Step 1: Set the new quality level
      const qualityLevels = (
        player as unknown as { qualityLevels: () => QualityLevelList }
      ).qualityLevels()

      if (height === 'auto') {
        // Enable all quality levels for auto mode
        for (let i = 0; i < qualityLevels.length; i++) {
          qualityLevels[i].enabled = true
        }
        setAutoMode(true)
      } else {
        // Disable all qualities except the selected one
        for (let i = 0; i < qualityLevels.length; i++) {
          qualityLevels[i].enabled = qualityLevels[i].height === height
        }
        setAutoMode(false)
        setCurrentQuality(`${height}p`)

        // Force immediate quality change by reloading the video
        try {
          // Show loading state
          setLoading(true)

          // Access the tech and representations directly
          const tech = player.tech({
            IWillNotUseThisInPlugins: true
          }) as unknown as HLSTech

          if (tech?.hls) {
            // For HLS streams, try to use HLS.js methods first
            tech.hls.playlists.media(tech.hls.selectPlaylist())

            // Force a reload at the current time
            setTimeout(() => {
              if (currentSource) {
                player.src(currentSource)

                player.one('loadedmetadata', () => {
                  player.currentTime(currentTime)
                  if (wasPlaying) {
                    void player.play()
                  }
                })
              }
            }, 0)
          }

          // Handle loading state
          const handlePlaying = (): void => {
            setLoading(false)
            player.off('playing', handlePlaying)
          }
          player.on('playing', handlePlaying)
        } catch (error) {
          console.error('Error during quality switch:', error)
          setLoading(false)
        }
      }
    },
    [player]
  )

  const handleQualitySelect = useCallback(
    (qualityLevels: QualityLevelList): void => {
      if (qualityLevels.selectedIndex !== -1) {
        const selectedQuality = qualityLevels[qualityLevels.selectedIndex]
        if (selectedQuality) {
          setCurrentQuality(`${selectedQuality.height}p`)
        }
      }
    },
    []
  )

  useEffect(() => {
    const qualityLevels = (
      player as unknown as { qualityLevels: () => QualityLevelList }
    ).qualityLevels()

    qualityLevels.on('addqualitylevel', () =>
      updateQualityLevels(qualityLevels)
    )
    qualityLevels.on('change', () => handleQualitySelect(qualityLevels))

    // Initial quality levels update
    updateQualityLevels(qualityLevels)

    return () => {
      qualityLevels.off('addqualitylevel', () =>
        updateQualityLevels(qualityLevels)
      )
      qualityLevels.off('change', () => handleQualitySelect(qualityLevels))
    }
  }, [player, updateQualityLevels, handleQualitySelect])

  return (
    <SettingsMenu
      player={player}
      isMobile={isMobile}
      qualities={qualities}
      currentQuality={currentQuality}
      autoMode={autoMode}
      onQualityChange={handleQualityChange}
    />
  )
}
