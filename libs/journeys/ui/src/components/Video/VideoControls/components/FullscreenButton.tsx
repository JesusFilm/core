import FullscreenExitRounded from '@mui/icons-material/FullscreenExitRounded'
import FullscreenRounded from '@mui/icons-material/FullscreenRounded'
import IconButton from '@mui/material/IconButton'

interface FullscreenButtonProps {
  fullscreen: boolean
  handleClick: () => void
}

export function FullscreenButton({
  handleClick,
  fullscreen
}: FullscreenButtonProps): JSX.Element {
  return (
    <IconButton
      aria-label="fullscreen"
      onClick={handleClick}
      sx={{ py: 0, px: 2 }}
    >
      {fullscreen ? <FullscreenExitRounded /> : <FullscreenRounded />}
    </IconButton>
  )
}
