import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import IconButton from '@mui/material/IconButton'

interface PlayButtonProps {
  playing: boolean
  handleClick: () => void
}

export function PlayButton({
  playing,
  handleClick
}: PlayButtonProps): JSX.Element {
  return (
    <IconButton
      aria-label={playing ? 'bar-pause-button' : 'bar-play-button'}
      onClick={handleClick}
      sx={{
        // display: { xs: 'none', lg: 'flex' },
        ml: { xs: 0, lg: -1 }
      }}
    >
      {!playing ? <PlayArrowRounded /> : <PauseRounded />}
    </IconButton>
  )
}
