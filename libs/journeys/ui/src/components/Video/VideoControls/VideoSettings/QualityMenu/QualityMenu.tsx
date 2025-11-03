import ArrowBackIosNewRounded from '@mui/icons-material/ArrowBackIosNewRounded'
import CheckIcon from '@mui/icons-material/Check'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import VideoJsPlayer from '../../../utils/videoJsTypes'
import { getYoutubeQualityMap } from '../../../utils/youtubeQualityMap'

export interface QualityMenuItem {
  resolution: string
  qualityLevel: number
  height: number
}

interface QualityMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onBack: () => void
  player: VideoJsPlayer
  onQualityChanged: (quality: string) => void
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
  const initialQualitiesSet = useRef(false)

  const isSafari = useMemo(() => {
    if (typeof window === 'undefined') return false
    if (typeof navigator === 'undefined') return false
    if (typeof navigator.userAgent === 'undefined') return false
    return (
      navigator.userAgent.includes('Safari') &&
      !navigator.userAgent.includes('Chrome')
    )
  }, [])

  // Sets the quality levels from the player
  useEffect(() => {
    if (initialQualitiesSet.current) return

    const tech = player.tech({ IWillNotUseThisInPlugins: true })
    let qualities: QualityMenuItem[] = []

    // For Safari, only add the Auto option
    if (isSafari) {
      // Still set initialQualitiesSet to true for Safari
      initialQualitiesSet.current = true
    } else if (tech != null && 'vhs' in tech) {
      const qualityLevels = player.qualityLevels()

      qualities = Array.from({ length: qualityLevels.length }).reduce<
        QualityMenuItem[]
      >((acc, _, i) => {
        const index = qualityLevels.length - 1 - i
        const level = qualityLevels[index]
        const height = level?.height ?? 0
        const resolution =
          height >= 2160 ? t('4K') : height >= 1440 ? t('2K') : `${height}p`

        if (!acc.some((q) => q.height === height)) {
          const insertPosition = acc.findIndex((item) => item.height < height)

          if (insertPosition !== -1) {
            acc.splice(insertPosition, 0, {
              resolution,
              qualityLevel: index,
              height
            })
          } else {
            acc.push({ resolution, qualityLevel: index, height })
          }
        }
        return acc
      }, [])
      if (qualities.length > 0) {
        initialQualitiesSet.current = true
      }
    } else if (tech != null && 'ytPlayer' in tech) {
      initialQualitiesSet.current = true
    }

    setQualities([
      {
        resolution: t('Auto'),
        qualityLevel: -1,
        height: Number.MAX_SAFE_INTEGER
      },
      ...qualities
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, onQualityChanged, open, isSafari])

  // Handles the auto quality change
  useEffect(() => {
    if (selectedQuality === -1) {
      const qualityLevels = player.qualityLevels()

      const handleAutoQualityChange = () => {
        const tech = player.tech({ IWillNotUseThisInPlugins: true })

        if (
          tech != null &&
          'ytPlayer' in tech &&
          tech?.ytPlayer?.getPlaybackQuality != null
        ) {
          const currentQuality = tech.ytPlayer.getPlaybackQuality()
          const displayQuality =
            getYoutubeQualityMap(t)[currentQuality] ?? currentQuality

          onQualityChanged(`${t('Auto')} (${displayQuality})`)
        } else if (tech != null && 'vhs' in tech) {
          const activeResolution = qualities.find(
            (q) => q.qualityLevel === qualityLevels.selectedIndex
          )?.resolution

          if (activeResolution == null || activeResolution === 'Auto') {
            onQualityChanged(`${t('Auto')}`)
          } else {
            onQualityChanged(`${t('Auto')} (${activeResolution})`)
          }
        }
      }

      qualityLevels.on('change', handleAutoQualityChange)
      handleAutoQualityChange()

      return () => {
        qualityLevels.off('change', handleAutoQualityChange)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, selectedQuality, onQualityChanged, qualities, isSafari])

  const handleQualityChange = (quality: number): void => {
    const qualityLevels = player.qualityLevels()
    const tech = player.tech({ IWillNotUseThisInPlugins: true })

    if (!(tech != null && 'vhs' in tech)) {
      onClose()
      return
    }

    const currentTime = player.currentTime()
    const wasPlaying = !player.paused()
    player.pause()

    // Clears buffer
    // not supported in Safari, and no work arounds
    // quality may not change immediately
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
    // Get active resolution directly from the qualityLevels array
    const selectedLevel =
      activeQualityLevel !== -1 ? qualityLevels[activeQualityLevel] : null
    const height = selectedLevel?.height ?? 0

    // Format the resolution consistently
    const activeResolution =
      height >= 2160
        ? t('4K')
        : height >= 1440
          ? t('2K')
          : height > 0
            ? `${height}p`
            : null

    const displayQuality =
      quality === -1 && activeResolution != null
        ? `${t('Auto')} (${activeResolution})`
        : (qualities.find((q) => q.qualityLevel === quality)?.resolution ??
          t('Auto'))

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
