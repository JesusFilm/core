import Slider from '@mui/material/Slider'

interface PropertiesSliderProps {
  value: number
  min: number
  max: number
  step: number
  onChange: (event: Event, value: number | number[]) => void
  onChangeCommitted: (event: Event, value: number | number[]) => void
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
            color: '#C52D3A',
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
            backgroundColor: '#DEDFE0'
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
