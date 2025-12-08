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
  sx?: SxProps<Theme>
  mobileIcon?: ReactElement
}

export function RadioSelect<T extends string>({
  value,
  defaultValue,
  options,
  onChange: handleChange,
  triggerPrefix,
  ariaLabel,
  open,
  sx,
  mobileIcon
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
    setAnchorEl(event.currentTarget)
    setShowOptions(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
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

  const showMobileIcon = !breakpoints.sm && mobileIcon != null

  return (
    <>
      <Box
        ref={triggerRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={showOptions}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '2px solid',
          borderColor: (theme) => theme.palette.secondary.light,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          color: (theme) => theme.palette.secondary.main,
          paddingTop: showMobileIcon ? '4px' : '4px',
          paddingBottom: showMobileIcon ? '4px' : '4px',
          paddingLeft: showMobileIcon ? '4px' : '14px',
          paddingRight: showMobileIcon ? '4px' : '8px',
          '&:hover': {
            borderColor: (theme) => theme.palette.secondary.main
          },
          '&:focus': {
            outline: 'none',
            borderColor: (theme) => theme.palette.secondary.main
          },
          ...sx
        }}
      >
        {showMobileIcon ? (
          mobileIcon
        ) : (
          <>
            {triggerPrefix}
            {currentLabel}
            <KeyboardArrowDown
              sx={{
                fontSize: '1rem',
                ml: 0,
                pl: 0
              }}
            />
          </>
        )}
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
