import Slider from '@mui/material/Slider'
import { styled } from '@mui/material/styles'
import debounce from 'lodash/debounce'
import { ReactElement, useEffect, useRef, useState } from 'react'

interface OpacitySliderProps {
  value: number // 0-100 range
  onChange?: (value: number) => void
  selectedColor: string // hex color
  disabled?: boolean
}

const StyledOpacitySlider = styled(Slider)<{ selectedcolor: string }>(
  ({ selectedcolor }) => ({
    height: 20,
    padding: '0 !important',
    '& .MuiSlider-track': {
      border: 'none',
      height: 20,
      borderRadius: 10,
      backgroundColor: 'transparent',
      opacity: 1
    },
    '& .MuiSlider-rail': {
      height: 20,
      borderRadius: 10,
      background: `
        repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 50% / 16px 16px
      `,
      opacity: 1,
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 10,
        background: `linear-gradient(to right, transparent 0%, ${selectedcolor} 100%)`,
        zIndex: 1
      }
    },
    '& .MuiSlider-thumb': {
      height: 24,
      width: 24,
      backgroundColor: 'transparent',
      border: '2px solid #fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        backgroundColor: 'transparent'
      },
      '&::before': {
        display: 'none'
      }
    }
  })
)

export function OpacitySlider({
  value,
  onChange,
  selectedColor,
  disabled = false
}: OpacitySliderProps): ReactElement {
  const [localValue, setLocalValue] = useState(value)

  const debouncedChange = useRef(
    debounce((opacity: number) => {
      onChange?.(opacity)
    }, 100)
  ).current

  useEffect(() => {
    return () => {
      debouncedChange.cancel()
    }
  }, [debouncedChange])

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  function handleChange(_event: Event, newValue: number | number[]): void {
    const opacity = Array.isArray(newValue) ? newValue[0] : newValue
    setLocalValue(opacity)
    void debouncedChange(opacity)
  }

  return (
    <StyledOpacitySlider
      data-testid="OpacitySlider"
      selectedcolor={selectedColor}
      value={localValue}
      onChange={handleChange}
      min={0}
      max={100}
      step={1}
      disabled={disabled}
      aria-label="Opacity"
    />
  )
}
