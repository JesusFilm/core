import FullscreenExitRounded from '@mui/icons-material/FullscreenExitRounded'
import FullscreenRounded from '@mui/icons-material/FullscreenRounded'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface MobileControlsProps {
  showTime: boolean
  displayTime: string
  duration: string | null
  startAt: number
  endAt: number
  progress: number
  handleSeek: (e: Event, value: number | number[]) => void
  disableProgress: boolean
  showFullscreenButton: boolean
  fullscreen: boolean
  handleFullscreen: () => void
}

export function MobileControls({
  showTime,
  displayTime,
  duration,
  startAt,
  endAt,
  progress,
  handleSeek,
  disableProgress,
  showFullscreenButton,
  fullscreen,
  handleFullscreen
}: MobileControlsProps): JSX.Element {
  return (
    <Container
      data-testid="mobile-controls"
      sx={{
        display: {
          xs: 'block',
          lg: 'none'
        }
      }}
    >
      {/* Time Label and Fullscreen Button */}
      <Stack
        direction="row"
        gap={5}
        justifyContent="space-between"
        alignItems="center"
      >
        {showTime && (
          <Typography
            variant="caption"
            color="secondary.main"
            noWrap
            overflow="unset"
            sx={{ p: 2 }}
          >
            {displayTime} / {duration}
          </Typography>
        )}
        {showFullscreenButton && (
          <IconButton
            aria-label="fullscreen"
            onClick={handleFullscreen}
            sx={{ py: 0, px: 2 }}
          >
            {fullscreen ? <FullscreenExitRounded /> : <FullscreenRounded />}
          </IconButton>
        )}
      </Stack>
      <Slider
        aria-label="mobile-progress-control"
        min={startAt}
        max={endAt - 0.25}
        value={progress}
        onChange={handleSeek}
        valueLabelFormat={displayTime}
        valueLabelDisplay="auto"
        disabled={disableProgress}
        sx={{
          width: 'initial',
          height: 5,
          mx: 2.5,
          py: 2,
          display: 'flex',
          '& .MuiSlider-thumb': {
            width: 10,
            height: 10,
            mr: -3
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'secondary.main'
          },
          '& .MuiSlider-track': {
            border: 'none'
          }
        }}
      />
    </Container>
  )
}
