import Slider, { SliderProps } from '@mui/material/Slider'

export function Progress(props: SliderProps): JSX.Element {
  return (
    <Slider
      {...props}
      aria-label="mobile-progress-control"
      valueLabelDisplay="auto"
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
  )
}
