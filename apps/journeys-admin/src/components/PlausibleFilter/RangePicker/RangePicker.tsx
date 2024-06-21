import Popover from '@mui/material/Popover'
import { ComponentProps, ReactElement, useEffect, useState } from 'react'
import { DateRange, DayPicker } from 'react-day-picker'

interface RangePickerProps {
  onSelect: (range: DateRange) => void
  onClose: ComponentProps<typeof Popover>['onClose']
  anchorEl: ComponentProps<typeof Popover>['anchorEl']
  open?: boolean
}

export function RangePicker({
  onSelect,
  onClose: handleClose,
  anchorEl,
  open = false
}: RangePickerProps): ReactElement {
  const [selected, setSelected] = useState<DateRange>()

  function handleSelect(range: DateRange | undefined): void {
    setSelected(range)
    if (range?.from != null && range?.to != null) onSelect(range)
  }

  useEffect(() => {
    if (open) setSelected(undefined)
  }, [open])

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      sx={{
        color: 'pink',
        '.rdp': {
          '--rdp-background-color': (theme) => theme.palette.primary.main,
          '--rdp-accent-color': (theme) => theme.palette.primary.main,
          '.rdp-button': {
            ':hover': {
              color: (theme) => theme.palette.primary.contrastText
            }
          }
        }
      }}
    >
      <DayPicker
        mode="range"
        onSelect={handleSelect}
        selected={selected}
        disabled={{ after: new Date() }}
      />
    </Popover>
  )
}
