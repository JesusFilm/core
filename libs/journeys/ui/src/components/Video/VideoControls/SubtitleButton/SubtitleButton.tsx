import SubtitlesOutlined from '@mui/icons-material/SubtitlesOutlined'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import VideoJsPlayer from '../../utils/videoJsTypes'

interface SubtitleButtonProps {
  player: VideoJsPlayer
}

export function SubtitleButton({ player }: SubtitleButtonProps): ReactElement {
  return (
    <IconButton
      aria-label="subtitles"
      aria-controls="subtitle-menu"
      sx={{
        color: 'common.white',
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
    >
      <SubtitlesOutlined />
    </IconButton>
  )
}
