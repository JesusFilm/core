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
    <Box>
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
              control={
                <Radio
                  size="small"
                  sx={{
                    height: '20px',
                    width: '20px',
                    marginRight: '10px'
                  }}
                />
              }
              label={option.label}
              sx={{
                padding: '8px 20px 8px 12px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)'
                },
                '& .MuiFormControlLabel-label': {
                  typography: 'body2'
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
          borderColor: 'secondary.light',
          typography: 'subtitle3',
          color: 'secondary.light',
          paddingTop: 1,
          paddingBottom: 1,
          paddingLeft: showMobileIcon ? 1 : 3.5,
          paddingRight: showMobileIcon ? 1 : 2,
          '&:hover': {
            borderColor: 'secondary.light',
            color: 'secondary.light',
            backgroundColor: 'rgba(220, 221, 229, 0.15)',
            '& .MuiSvgIcon-root': {
              color: 'secondary.light'
            }
          },
          '&:focus': {
            outline: 'none',
            borderColor: 'secondary.light'
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
                ml: 1,
                pl: 0,
                color: 'secondary.light'
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
