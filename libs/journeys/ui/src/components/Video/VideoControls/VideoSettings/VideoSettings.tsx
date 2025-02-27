import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'
import { MouseEvent, ReactElement, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { QualityMenu } from './QualityMenu'
import { SettingsMenu } from './SettingsMenu'

interface VideoSettingsProps {
  player: Player
}

export function VideoSettings({ player }: VideoSettingsProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showQualityMenu, setShowQualityMenu] = useState(false)

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (): void => {
    setAnchorEl(null)
    setShowQualityMenu(false)
  }

  const handleQualityClick = (): void => {
    setShowQualityMenu(true)
  }

  const handleQualityBack = (): void => {
    setShowQualityMenu(false)
  }

  const handleQualityChange = (quality: number): void => {
    // Will implement quality change logic in next step
    console.log('Quality changed to:', quality)
  }

  // Temporary mock data until we implement quality levels
  const mockQualities = [
    { resolution: 'Auto', qualityLevel: -1 },
    { resolution: '1080p', qualityLevel: 0 },
    { resolution: '720p', qualityLevel: 1 },
    { resolution: '480p', qualityLevel: 2 },
    { resolution: '360p', qualityLevel: 3 }
  ]

  const currentQuality =
    mockQualities.find((q) => q.qualityLevel === -1)?.resolution ?? 'Auto'
  const open = Boolean(anchorEl)

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label="video settings"
        aria-controls={open ? 'settings-menu' : undefined}
        aria-expanded={open}
        aria-haspopup
        sx={{
          color: 'common.white',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <SettingsIcon />
      </IconButton>
      <SettingsMenu
        anchorEl={anchorEl}
        open={open && !showQualityMenu}
        onClose={handleClose}
        currentQuality={currentQuality}
        onQualityClick={handleQualityClick}
      />
      <QualityMenu
        anchorEl={anchorEl}
        open={open && showQualityMenu}
        onClose={handleClose}
        onBack={handleQualityBack}
        qualities={mockQualities}
        selectedQuality={-1}
        onQualityChange={handleQualityChange}
      />
    </>
  )
}
