import { ReactElement, useState } from 'react'

import VideoJsPlayer from '../../utils/videoJsTypes'

import { QualityMenu } from './QualityMenu'
import { SettingsButton } from './SettingsButton'
import { SettingsMenu } from './SettingsMenu'

interface VideoSettingsProps {
  player: VideoJsPlayer
  onToggleStats: (event: React.MouseEvent) => void
}

export function VideoSettings({
  player,
  onToggleStats
}: VideoSettingsProps): ReactElement {
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

  const handleToggleStats = (event: React.MouseEvent): void => {
    onToggleStats(event)
    handleClose()
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <SettingsButton onClick={handleClick} open={open} />
      <SettingsMenu
        anchorEl={anchorEl}
        open={open && !showQualityMenu}
        onClose={handleClose}
        currentQuality={currentQuality}
        onQualityClick={handleQualityClick}
        onToggleStats={handleToggleStats}
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
