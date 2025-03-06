import { ReactElement, useState } from 'react'

import VideoJsPlayer from '../../utils/videoJsTypes'

import { QualityMenu } from './QualityMenu/QualityMenu'
import { SettingsButton } from './SettingsButton'
import { SettingsMenu } from './SettingsMenu/SettingsMenu'

interface VideoSettingsProps {
  player: VideoJsPlayer
}

export function VideoSettings({ player }: VideoSettingsProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [currentQuality, setCurrentQuality] = useState('Auto')

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
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

  const handleQualityChanged = (quality: string): void => {
    setCurrentQuality(quality)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <SettingsButton
        onClick={handleClick}
        aria-controls={open ? 'settings-menu' : undefined}
        aria-haspopup
        aria-expanded={open}
      />
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
        player={player}
        onQualityChanged={handleQualityChanged}
      />
    </>
  )
}
