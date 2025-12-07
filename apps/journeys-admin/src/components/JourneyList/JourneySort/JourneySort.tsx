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

export enum SortOrder {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  UPDATED_AT = 'updatedAt'
}

interface JourneySortProps {
  sortOrder?: SortOrder
  onChange: (value: SortOrder) => void
  open?: boolean // for testing
  disabled?: boolean
}

interface SortOption {
  sortOrder: SortOrder
  displayValue: string
}

export function JourneySort({
  sortOrder,
  onChange: handleChange,
  open,
  disabled
}: JourneySortProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [showSortOrder, setShowSortOrder] = useState(open ?? false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const breakpoints = useBreakpoints()
  const triggerRef = useRef<HTMLDivElement>(null)

  const sortOrderLabel = {
    createdAt: t('Date Created'),
    title: t('Name'),
    updatedAt: t('Last Modified')
  }

  const sortOptions: SortOption[] = [
    {
      sortOrder: SortOrder.CREATED_AT,
      displayValue: sortOrderLabel.createdAt
    },
    {
      sortOrder: SortOrder.TITLE,
      displayValue: sortOrderLabel.title
    },
    {
      sortOrder: SortOrder.UPDATED_AT,
      displayValue: sortOrderLabel.updatedAt
    }
  ]

  useEffect(() => {
    setAnchorEl(triggerRef.current)
  }, [triggerRef])

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    if (disabled) return
    setAnchorEl(event.currentTarget)
    setShowSortOrder(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setAnchorEl(event.currentTarget)
      setShowSortOrder(true)
    }
  }

  const handleClose = (): void => {
    setAnchorEl(null)
    setShowSortOrder(false)
  }

  const handleSubmit = (event: ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault()
    handleChange(event.currentTarget.value as SortOrder)
    handleClose()
  }

  const Form = (): ReactElement => (
    <Box sx={{ py: 2, px: 4 }}>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          aria-label="sort-by-options"
          defaultValue={sortOrder ?? SortOrder.UPDATED_AT}
          name="sort-by-buttons-group"
          onChange={handleSubmit}
          sx={{
            gap: 0,
            '& .MuiFormControlLabel-root': {
              margin: 0
            }
          }}
        >
          {sortOptions.map((option) => (
            <FormControlLabel
              key={option.sortOrder}
              value={option.sortOrder}
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        />
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
        aria-label={t('Sort By')}
        aria-haspopup="listbox"
        aria-expanded={showSortOrder}
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
          }
        }}
      >
        {t('Sort By: ')}
        {sortOrderLabel[sortOrder ?? SortOrder.UPDATED_AT]}
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
          open={showSortOrder}
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
        <Drawer anchor="bottom" open={showSortOrder} onClose={handleClose}>
          <Form />
        </Drawer>
      )}
    </>
  )
}
