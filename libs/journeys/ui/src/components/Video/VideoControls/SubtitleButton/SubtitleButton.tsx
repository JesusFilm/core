import SubtitlesOutlined from '@mui/icons-material/SubtitlesOutlined'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import VideoJsPlayer from '../../utils/videoJsTypes'

import { SubtitleMenu } from './SubtitleMenu'

interface SubtitleButtonProps {
  player: VideoJsPlayer
  source: VideoBlockSource
}

export function SubtitleButton({
  player,
  source
}: SubtitleButtonProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleClick(event: React.MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(): void {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <IconButton
        aria-label="subtitles"
        aria-controls="subtitle-menu"
        aria-expanded={open}
        aria-haspopup={open}
        onClick={handleClick}
        sx={{
          color: 'common.white',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <SubtitlesOutlined />
      </IconButton>
      <SubtitleMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        player={player}
        source={source}
      />
    </>
  )
}
