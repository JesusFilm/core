import {
  ReactElement,
  useState,
  useEffect,
  useRef,
  MouseEvent,
  ChangeEvent
} from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormControlLabel from '@mui/material/FormControlLabel'
import Popover from '@mui/material/Popover'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import { useBreakpoints } from '@core/shared/ui'

enum SortOrder {
  CREATED_AT = 'createdAt',
  TITLE = 'title'
}

const sortOrderLabel = {
  createdAt: 'Date Created',
  title: 'Name'
}

interface JourneySortProps {
  sortOrder?: SortOrder
  onChange: (value: SortOrder) => void
  open?: boolean // for testing
}

export function JourneySort({
  sortOrder,
  onChange: handleChange,
  open
}: JourneySortProps): ReactElement {
  const [showSortOrder, setShowSortOrder] = useState(open ?? false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const breakpoints = useBreakpoints()
  const chipRef = useRef(null)

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
        <FormLabel component="legend">Sort By</FormLabel>
        <RadioGroup
          aria-label="sort-by-options"
          defaultValue={sortOrder ?? SortOrder.CREATED_AT}
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
        </RadioGroup>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          <Button
            sx={{ mt: 1, mr: 1 }}
            onClick={() => setShowSortOrder(false)}
            variant="text"
          >
            Cancel
          </Button>
        </Box>
      </FormControl>
    </Box>
  )

  return (
    <>
      <Chip
        label={sortOrder != null ? sortOrderLabel[sortOrder] : 'Sort By'}
        onClick={handleClick}
        ref={chipRef}
      />
      {breakpoints.md ? (
        <Popover
          open={showSortOrder}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
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

export { SortOrder }
