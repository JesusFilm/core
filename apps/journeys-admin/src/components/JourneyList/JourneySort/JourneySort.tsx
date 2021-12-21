import {
  ReactElement,
  useState,
  useEffect,
  useRef,
  MouseEvent,
  ChangeEvent
} from 'react'
import {
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  FormLabel,
  FormControlLabel,
  Popover,
  RadioGroup,
  Radio
} from '@mui/material'
import { useBreakpoints } from '@core/shared/ui'

export enum SortBy {
  UNDEFINED = 'undefined',
  CREATED_AT = 'createdAt',
  TITLE = 'title'
}

const sortByLabel = {
  createdAt: 'Date Created',
  title: 'Name'
}

interface JourneySortProps {
  sortBy: SortBy
  setSortBy: (value: SortBy) => void
  open?: boolean // for testing
}

export function JourneySort({
  sortBy,
  setSortBy,
  open
}: JourneySortProps): ReactElement {
  const [showSortBy, setShowSortBy] = useState(open ?? false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const breakpoints = useBreakpoints()
  const chipRef = useRef(null)

  useEffect(() => {
    setAnchorEl(chipRef.current)
  }, [chipRef])

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
    setShowSortBy(true)
  }

  const handleClose = (): void => {
    setAnchorEl(null)
    setShowSortBy(false)
  }

  const handleSubmit = (event: ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault()
    setSortBy(event.currentTarget.value as SortBy)
    handleClose()
  }

  const Form = (): ReactElement => (
    <Box sx={{ p: 4 }}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">Sort By</FormLabel>
        <RadioGroup
          aria-label="sort-by-options"
          defaultValue={
            sortBy === SortBy.UNDEFINED ? SortBy.CREATED_AT : sortBy
          }
          name="sort-by-buttons-group"
          onChange={handleSubmit}
        >
          <FormControlLabel
            value={SortBy.CREATED_AT}
            control={<Radio />}
            label={sortByLabel.createdAt}
          />
          <FormControlLabel
            value={SortBy.TITLE}
            control={<Radio />}
            label={sortByLabel.title}
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
            onClick={() => setShowSortBy(false)}
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
        label={sortBy === SortBy.UNDEFINED ? 'Sort By' : sortByLabel[sortBy]}
        onClick={handleClick}
        ref={chipRef}
      />
      {breakpoints.md ? (
        <Popover
          open={showSortBy}
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
        <Drawer anchor="bottom" open={showSortBy} onClose={handleClose}>
          <Form />
        </Drawer>
      )}
    </>
  )
}
