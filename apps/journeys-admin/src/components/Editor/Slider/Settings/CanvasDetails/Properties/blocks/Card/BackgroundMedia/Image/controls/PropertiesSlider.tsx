import Slider from '@mui/material/Slider'
import { useTheme } from '@mui/material/styles'

interface PropertiesSliderProps {
  value: number
  min: number
  max: number
  step: number
  onChange: (event: Event, value: number) => void
  onChangeCommitted: (event: Event, value: number) => void
  ariaLabel?: string
  color?: string
  railColor?: string
  thumbSize?: number
  trackHeight?: number
  borderRadius?: number
}

export function PropertiesSlider({
  value,
  min,
  max,
  step,
  onChange,
  onChangeCommitted,
  ariaLabel = 'Slider'
}: PropertiesSliderProps) {
  const { palette } = useTheme()

  return (
    <Slider
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      onChangeCommitted={onChangeCommitted}
      slotProps={{
        root: {
          style: {
            flex: 1,
            color: palette.primary.main,
            borderRadius: 4
          }
        },
        thumb: {
          style: {
            width: 14,
            height: 14
          }
        },
        rail: {
          style: {
            height: 3,
            backgroundColor: palette.divider
          }
        },
        track: {
          style: {
            height: 3
          }
        }
      }}
      aria-label={ariaLabel}
      tabIndex={0}
    />
  )
}
