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
          levels.push({ resolution, qualityLevel: i, height })
        }
      }

      // Sort levels by height in descending order
      levels.sort((a, b) => (b.height ?? 0) - (a.height ?? 0))

      // Add Auto option at the top
      levels.unshift({ resolution: 'Auto', qualityLevel: -1, height: Infinity })

      // Remove height property before setting state
      setQualities(
        levels.map(({ resolution, qualityLevel }) => ({
          resolution,
          qualityLevel
        }))
      )

      // Find currently selected quality
      const selectedIndex = Array.from(qualityLevels).findIndex(
        (level) => level.enabled
      )
      const newQuality = selectedIndex === -1 ? -1 : selectedIndex

      // Only update selected quality if it was previously set by user
      if (selectedQuality !== -1) {
        setSelectedQuality(newQuality)
      }

      // Always notify parent of current active quality
      const activeQualityLevel = qualityLevels.selectedIndex
      const activeResolution = levels.find(
        (q) => q.qualityLevel === activeQualityLevel
      )?.resolution
      const displayQuality =
        selectedQuality === -1 && activeResolution != null
          ? `Auto (${activeResolution})`
          : (qualities.find((q) => q.qualityLevel === selectedQuality)
              ?.resolution ?? 'Auto')
      onQualityChanged(displayQuality)
    }

    qualityLevels.on('change', handleQualityChange)
    handleQualityChange() // Initial setup

    return () => {
      qualityLevels.off('change', handleQualityChange)
    }
  }, [player, onQualityChanged, selectedQuality, qualities])

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

    // Find currently active quality for Auto mode
    const activeQualityLevel = qualityLevels.selectedIndex
    const activeResolution = qualities.find(
      (q) => q.qualityLevel === activeQualityLevel
    )?.resolution

    // Show actual quality in Auto mode
    const displayQuality =
      quality === -1 && activeResolution != null
        ? `Auto (${activeResolution})`
        : (qualities.find((q) => q.qualityLevel === quality)?.resolution ??
          'Auto')

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
