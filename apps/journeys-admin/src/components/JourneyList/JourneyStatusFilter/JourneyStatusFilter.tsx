import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Popover from '@mui/material/Popover'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { useTranslation } from 'next-i18next'
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

import type { JourneyStatus } from '../JourneyListView/JourneyListView'

interface JourneyStatusFilterProps {
  status?: JourneyStatus
  onChange: (value: JourneyStatus) => void
  open?: boolean // for testing
  disabled?: boolean
}

interface StatusOption {
  queryParam: JourneyStatus
  displayValue: string
}

export function JourneyStatusFilter({
  status,
  onChange: handleChange,
  open,
  disabled
}: JourneyStatusFilterProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [showOptions, setShowOptions] = useState(open ?? false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const breakpoints = useBreakpoints()
  const triggerRef = useRef<HTMLDivElement>(null)

  const statusOptions: StatusOption[] = [
    {
      queryParam: 'active',
      displayValue: t('Active')
    },
    {
      queryParam: 'archived',
      displayValue: t('Archived')
    },
    {
      queryParam: 'trashed',
      displayValue: t('Trash')
    }
  ]

  const statusLabel: Record<JourneyStatus, string> = {
    active: t('Active'),
    archived: t('Archived'),
    trashed: t('Trash')
  }

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
    handleChange(event.currentTarget.value as JourneyStatus)
    handleClose()
  }

  const Form = (): ReactElement => (
    <Box sx={{ py: 2, px: 4 }}>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          aria-label="status-filter-options"
          defaultValue={status ?? 'active'}
          name="status-filter-buttons-group"
          onChange={handleSubmit}
          sx={{
            gap: 0,
            '& .MuiFormControlLabel-root': {
              margin: 0
            }
          }}
        >
          {statusOptions.map((option) => (
            <FormControlLabel
              key={option.queryParam}
              value={option.queryParam}
              control={<Radio size="small" />}
              label={option.displayValue}
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
        aria-label={t('Filter by status')}
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
          marginRight: '12px',
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
          }
        }}
      >
        {status != null ? statusLabel[status] : statusLabel.active}
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
