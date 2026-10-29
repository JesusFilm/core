import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'

interface SliderRowProps {
  /** The slider's id stem: its label is `${id}`, read by the slider. */
  id: string
  label: string
  /** The saved value; the slider follows the pointer from it while dragged. */
  value: number
  min: number
  max: number
  step: number
  /** The value as the author reads it, beside the label and on the thumb. */
  format: (value: number) => string
  helperText: string
  valueTestId: string
  /** Called once when the slider is released, with the value it settled on. */
  onCommit: (value: number) => void
}

function sliderValue(next: number | number[]): number {
  return Array.isArray(next) ? next[0] : next
}

/**
 * A labelled Inspector slider: the label with the current value on the
 * right, the slider, then a line of help. The slider follows the pointer
 * while it is dragged and reports the value once, when it is released.
 * Renders its rows bare, so they space as the surrounding stack spaces them.
 */
export function SliderRow({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  helperText,
  valueTestId,
  onCommit
}: SliderRowProps): ReactElement {
  const [dragged, setDragged] = useState(value)

  useEffect(() => {
    setDragged(value)
  }, [value])

  function handleChange(_event: unknown, next: number | number[]): void {
    setDragged(sliderValue(next))
  }

  function handleChangeCommitted(
    _event: unknown,
    next: number | number[]
  ): void {
    onCommit(sliderValue(next))
  }

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" id={id}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          data-testid={valueTestId}
        >
          {format(dragged)}
        </Typography>
      </Stack>
      <Slider
        aria-labelledby={id}
        value={dragged}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="auto"
        valueLabelFormat={format}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        sx={{ mx: 1, width: 'auto' }}
      />
      <Typography variant="caption" color="text.secondary">
        {helperText}
      </Typography>
    </>
  )
}
