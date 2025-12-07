import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Popover from '@mui/material/Popover'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { SxProps, Theme } from '@mui/material/styles'
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react'

import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

export interface RadioSelectOption<T extends string> {
  value: T
  label: string
}

export interface RadioSelectProps<T extends string> {
  value?: T
  defaultValue: T
  options: RadioSelectOption<T>[]
  onChange: (value: T) => void
  triggerPrefix?: string
  ariaLabel: string
  open?: boolean
  disabled?: boolean
  sx?: SxProps<Theme>
}

export function RadioSelect<T extends string>({
  value,
  defaultValue,
  options,
  onChange: handleChange,
  triggerPrefix,
  ariaLabel,
  open,
  disabled,
  sx
}: RadioSelectProps<T>): ReactElement {
  const [showOptions, setShowOptions] = useState(open ?? false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const breakpoints = useBreakpoints()
  const triggerRef = useRef<HTMLDivElement>(null)

  const currentValue = value ?? defaultValue
  const currentLabel =
    options.find((option) => option.value === currentValue)?.label ?? ''

  useEffect(() => {
    setAnchorEl(triggerRef.current)
  }, [triggerRef])

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    if (disabled) return
    setAnchorEl(event.currentTarget)
    setShowOptions(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setAnchorEl(event.currentTarget)
      setShowOptions(true)
    }
  }

  const handleClose = (): void => {
    setAnchorEl(null)
    setShowOptions(false)
  }

  const handleSubmit = (event: ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault()
    handleChange(event.currentTarget.value as T)
    handleClose()
  }

  const Form = (): ReactElement => (
    <Box sx={{ py: 2, px: 4 }}>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          aria-label={`${ariaLabel}-options`}
          defaultValue={currentValue}
          name={`${ariaLabel}-buttons-group`}
          onChange={handleSubmit}
          sx={{
            gap: 0,
            '& .MuiFormControlLabel-root': {
              margin: 0
            }
          }}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio size="small" />}
              label={option.label}
              sx={{
                margin: 0,
                paddingTop: '0',
                paddingBottom: '0',
                '& .MuiFormControlLabel-label': {
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '22px'
                }
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  )

  return (
    <>
      <Box
        ref={triggerRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={showOptions}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: '8px',
          border: '2px solid',
          borderColor: (theme) => theme.palette.secondary.light,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          color: (theme) =>
            disabled
              ? theme.palette.action.disabled
              : theme.palette.secondary.main,
          paddingTop: '4px',
          paddingBottom: '4px',
          paddingLeft: '14px',
          paddingRight: '8px',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          '&:hover': {
            borderColor: (theme) =>
              disabled
                ? theme.palette.secondary.light
                : theme.palette.secondary.main
          },
          '&:focus': {
            outline: 'none',
            borderColor: (theme) => theme.palette.secondary.main
          },
          ...sx
        }}
      >
        {triggerPrefix}
        {currentLabel}
        <KeyboardArrowDown
          sx={{
            fontSize: '1rem',
            ml: 1,
            pl: 1
          }}
        />
      </Box>
      {breakpoints.md ? (
        <Popover
          open={showOptions}
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
          slotProps={{
            paper: {
              sx: {
                mt: '6px',
                borderRadius: '8px'
              }
            }
          }}
        >
          <Form />
        </Popover>
      ) : (
        <Drawer anchor="bottom" open={showOptions} onClose={handleClose}>
          <Form />
        </Drawer>
      )}
    </>
  )
}
