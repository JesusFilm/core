import ArrowBackIosNewRounded from '@mui/icons-material/ArrowBackIosNewRounded'
import CheckIcon from '@mui/icons-material/Check'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import VideoJsPlayer from '../../../utils/videoJsTypes'

export interface QualityMenuItem {
  resolution: string
  qualityLevel: number
}

interface QualityMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onBack: () => void
  player: VideoJsPlayer
  onQualityChanged: (quality: string) => void
}

const YOUTUBE_QUALITY_LABELS: Record<string, string> = {
  hd2160: '4K',
  hd1440: '2K',
  hd1080: '1080p',
  hd720: '720p',
  large: '480p',
  medium: '360p',
  small: '240p',
  tiny: '144p'
}

export function QualityMenu({
  anchorEl,
  open,
  onClose,
  onBack,
  player,
  onQualityChanged
}: QualityMenuProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const [qualities, setQualities] = useState<QualityMenuItem[]>([])
  const [selectedQuality, setSelectedQuality] = useState<number>(-1)

  // Sets the quality levels from the player
  useEffect(() => {
    const tech = player.tech({ IWillNotUseThisInPlugins: true })
    let qualities: QualityMenuItem[] = []

    if (tech?.name_ === 'Html5') {
      const qualityLevels = player.qualityLevels()
      qualities = Array.from({ length: qualityLevels.length }).reduce<
        (QualityMenuItem & { height: number })[]
      >((acc, _, i) => {
        const index = qualityLevels.length - 1 - i
        const level = qualityLevels[index]
        const height = level.height
        const resolution =
          height >= 2160 ? '4K' : height >= 1440 ? '2K' : `${height}p`

        if (!acc.some((q) => q.height === height)) {
          acc.push({ resolution, qualityLevel: index, height })
        }
        return acc
      }, [])
    }
    setQualities([
      { resolution: 'Auto', qualityLevel: -1 },
      ...qualities.map(({ resolution, qualityLevel }) => ({
        resolution,
        qualityLevel
      }))
    ])
  }, [player, onQualityChanged, open])

  // Handles the auto quality change
  useEffect(() => {
    if (selectedQuality === -1) {
      const qualityLevels = player.qualityLevels()

      const handleAutoQualityChange = () => {
        const tech = player.tech({ IWillNotUseThisInPlugins: true })

        if (
          tech?.name_ === 'Youtube' &&
          tech?.ytPlayer?.getPlaybackQuality != null
        ) {
          const currentQuality = tech?.ytPlayer?.getPlaybackQuality() ?? ''
          const displayQuality =
            YOUTUBE_QUALITY_LABELS[currentQuality] ?? currentQuality
          onQualityChanged(`Auto (${displayQuality})`)
        } else if (tech?.name_ === 'Html5') {
          const activeResolution = qualities.find(
            (q) => q.qualityLevel === qualityLevels.selectedIndex
          )?.resolution
          if (activeResolution) {
            onQualityChanged(`Auto (${activeResolution})`)
          }
        }
      }

      qualityLevels.on('change', handleAutoQualityChange)
      handleAutoQualityChange()

      return () => {
        qualityLevels.off('change', handleAutoQualityChange)
      }
    }
  }, [player, selectedQuality, onQualityChanged, qualities])

  const handleQualityChange = (quality: number): void => {
    const qualityLevels = player.qualityLevels()
    const tech = player.tech({ IWillNotUseThisInPlugins: true })

    if (tech?.name_ !== 'Html5') {
      onClose()
      return
    }

    const currentTime = player.currentTime()
    const wasPlaying = !player.paused()
    player.pause()

    // Clears buffer
    const sourceBuffers = tech?.vhs?.mediaSource?.activeSourceBuffers
    if (sourceBuffers != null && sourceBuffers.length > 0) {
      const duration = player.duration() ?? 0
      Array.from(sourceBuffers).forEach((sourceBuffer: SourceBuffer) => {
        if (!sourceBuffer.updating) {
          sourceBuffer.remove(0, duration)
        }
      })
    }

    // Enable/disable quality levels
    Array.from({ length: qualityLevels.length }).forEach((_, i) => {
      qualityLevels[i].enabled = quality === -1 || i === quality
    })

    // Change quality level
    if (tech?.vhs?.playlistController_?.fastQualityChange_) {
      tech.vhs.playlistController_.fastQualityChange_()
    }

    setTimeout(async () => {
      // player sometimes skips ahead when changing quality
      player.currentTime(currentTime)
      if (wasPlaying) {
        await player.play()
      }
    }, 100)

    // Update display quality
    const activeQualityLevel = qualityLevels.selectedIndex
    const activeResolution = qualities.find(
      (q) => q.qualityLevel === activeQualityLevel
    )?.resolution

    const displayQuality =
      quality === -1 && activeResolution != null
        ? `Auto (${activeResolution})`
        : (qualities.find((q) => q.qualityLevel === quality)?.resolution ??
          'Auto')

    setSelectedQuality(quality)
    onQualityChanged(displayQuality)
    onClose()
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
    >
      <MenuItem onClick={onBack} sx={{ minWidth: 220 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ArrowBackIosNewRounded fontSize="small" />
          <Typography>{t('Quality')}</Typography>
        </Stack>
      </MenuItem>
      {qualities.map(({ resolution, qualityLevel }) => (
        <MenuItem
          key={`${resolution}-${qualityLevel}`}
          onClick={() => handleQualityChange(qualityLevel)}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: 150
          }}
        >
          {resolution}
          {selectedQuality === qualityLevel && (
            <CheckIcon fontSize="small" sx={{ ml: 1 }} />
          )}
        </MenuItem>
      ))}
    </Menu>
  )
}
