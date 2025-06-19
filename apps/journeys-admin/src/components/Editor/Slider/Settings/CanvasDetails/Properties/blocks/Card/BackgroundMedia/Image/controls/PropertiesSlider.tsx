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
  ariaLabel = 'Slider',
  color = '#C52D3A',
  railColor = '#DEDFE0',
  thumbSize = 14,
  trackHeight = 3,
  borderRadius = 4
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
            color,
            borderRadius
          }
        },
        thumb: {
          style: {
            width: thumbSize,
            height: thumbSize
          }
        },
        rail: {
          style: {
            height: trackHeight,
            backgroundColor: railColor
          }
        },
        track: {
          style: {
            height: trackHeight
          }
        }
      }}
      aria-label={ariaLabel}
      tabIndex={0}
    />
  )
} 