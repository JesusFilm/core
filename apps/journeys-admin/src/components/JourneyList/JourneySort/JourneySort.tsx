import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Popover from '@mui/material/Popover'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { useTranslation } from 'next-i18next'
import {
  ChangeEvent,
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
  const chipRef = useRef(null)

  const sortOrderLabel = {
    createdAt: t('Date Created'),
    title: t('Name'),
    updatedAt: t('Last Modified')
  }

  useEffect(() => {
    setAnchorEl(chipRef.current)
  }, [chipRef])

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
    setShowSortOrder(true)
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
    <Box sx={{ p: 4 }}>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          aria-label="sort-by-options"
          defaultValue={sortOrder ?? SortOrder.UPDATED_AT}
          name="sort-by-buttons-group"
          onChange={handleSubmit}
        >
          <FormControlLabel
            value={SortOrder.CREATED_AT}
            control={<Radio />}
            label={sortOrderLabel.createdAt}
          />
          <FormControlLabel
            value={SortOrder.TITLE}
            control={<Radio />}
            label={sortOrderLabel.title}
          />
          <FormControlLabel
            value={SortOrder.UPDATED_AT}
            control={<Radio />}
            label={sortOrderLabel.updatedAt}
          />
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
      <Chip
        label={sortOrder != null ? sortOrderLabel[sortOrder] : t('Sort By')}
        onClick={handleClick}
        ref={chipRef}
        sx={{
          backgroundColor: 'white',
          border: '1px solid',
          borderColor: 'divider',
          color: 'secondar.light'
        }}
        disabled={disabled != null && disabled}
      />
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
