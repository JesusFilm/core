import Slider, { SliderProps } from '@mui/material/Slider'

export function Progress(props: SliderProps): JSX.Element | null {
  return (
    <Slider
      {...props}
      aria-label="desktop-progress-control"
      valueLabelDisplay="auto"
      sx={{
        height: 8,
        display: 'flex',
        '& .MuiSlider-thumb': {
          width: 13,
          height: 13,
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
  )
}
