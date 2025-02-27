import ArrowBackIosNewRounded from '@mui/icons-material/ArrowBackIosNewRounded'
import CheckIcon from '@mui/icons-material/Check'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import Player from 'video.js/dist/types/player'

interface QualityLevel {
  height: number
  id: number
  enabled: boolean
}

interface QualityLevels {
  length: number
  on: (event: string, callback: () => void) => void
  off: (event: string, callback: () => void) => void
  selectedIndex: number
  [index: number]: QualityLevel
}

export interface QualityMenuItem {
  resolution: string
  qualityLevel: number
}

interface QualityMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onBack: () => void
  player: Player & { qualityLevels(): QualityLevels }
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

  useEffect(() => {
    // Get quality levels from the player
    const qualityLevels = player.qualityLevels()

    // Listen for changes in quality levels
    const handleQualityChange = () => {
      const levels = []
      // Add Auto option
      levels.push({ resolution: 'Auto', qualityLevel: -1 })

      // Add available quality levels
      const uniqueResolutions = new Set()
      for (let i = 0; i < qualityLevels.length; i++) {
        const level = qualityLevels[i]
        // Convert height to common resolution name
        const height = level.height
        let resolution = `${height}p`
        if (height >= 2160) resolution = '4K'
        else if (height >= 1440) resolution = '2K'

        // Only add if resolution hasn't been seen before
        if (!uniqueResolutions.has(resolution)) {
          uniqueResolutions.add(resolution)
          levels.push({ resolution, qualityLevel: i })
        }
      }

      setQualities(levels)

      // Only update selected quality if it was previously set by user
      if (selectedQuality !== -1) {
        // Find currently selected quality
        const selectedIndex = Array.from(qualityLevels).findIndex(
          (level) => level.enabled
        )
        const newQuality = selectedIndex === -1 ? -1 : selectedIndex
        setSelectedQuality(newQuality)

        // Notify parent of quality change
        const resolution =
          levels.find((q) => q.qualityLevel === newQuality)?.resolution ??
          'Auto'
        onQualityChanged(resolution)
      }
    }

    qualityLevels.on('change', handleQualityChange)
    handleQualityChange() // Initial setup

    return () => {
      qualityLevels.off('change', handleQualityChange)
    }
  }, [player, onQualityChanged, selectedQuality])

  const handleQualityChange = (quality: number): void => {
    const qualityLevels = player.qualityLevels()

    // Enable all levels for Auto
    if (quality === -1) {
      for (let i = 0; i < qualityLevels.length; i++) {
        qualityLevels[i].enabled = true
      }
    } else {
      // Enable only selected quality level
      for (let i = 0; i < qualityLevels.length; i++) {
        qualityLevels[i].enabled = i === quality
      }
    }

    setSelectedQuality(quality)

    // Notify parent of quality change
    const resolution =
      qualities.find((q) => q.qualityLevel === quality)?.resolution ?? 'Auto'
    onQualityChanged(resolution)
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
      <MenuItem onClick={onBack} sx={{ minWidth: 200 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ArrowBackIosNewRounded fontSize="small" />
          <Typography>{t('Quality')}</Typography>
        </Stack>
      </MenuItem>
      {qualities.map(({ resolution, qualityLevel }) => (
        <MenuItem
          key={resolution}
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
