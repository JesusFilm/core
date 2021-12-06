import {
  ReactElement,
  useState,
  useEffect,
  useRef,
  MouseEvent,
  FormEvent
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
  CREATED_AT = 'Date Created',
  TITLE = 'Name'
}

interface JourneySortProps {
  sortBy: SortBy
  setSortBy: (value: SortBy) => void
  open?: boolean // for testing
}

const JourneySort = ({
  sortBy,
  setSortBy,
  open
}: JourneySortProps): ReactElement => {
  const [showSortBy, setShowSortBy] = useState(open ?? false)
  const [value, setValue] = useState(sortBy)
  const [defaultSortbyValue, setDefaultSortByValue] = useState(SortBy.CREATED_AT)
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setSortBy(value)
    setDefaultSortByValue(value);
    handleClose()
  }

  const sortByForm = (): ReactElement => (
    <Box sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Sort By</FormLabel>
          <RadioGroup
            aria-label="sort-by-options"
            defaultValue={defaultSortbyValue}
            name="sort-by-buttons-group"
            onChange={(e) => setValue(e.currentTarget.value as SortBy)}
          >
            <FormControlLabel
              value={SortBy.CREATED_AT}
              control={<Radio />}
              label={SortBy.CREATED_AT}
            />
            <FormControlLabel
              value={SortBy.TITLE}
              control={<Radio />}
              label={SortBy.TITLE}
            />
          </RadioGroup>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Button
              sx={{ mt: 1, mr: 1 }}
              onClick={() => setShowSortBy(false)}
              variant="text"
            >
              Cancel
            </Button>
            <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="text">
              Apply
            </Button>
          </Box>
        </FormControl>
      </form>
    </Box>
  )

  return (
    <>
      <Chip
        label={sortBy === SortBy.UNDEFINED ? 'Sort By' : sortBy}
        onClick={handleClick}
        ref={chipRef}
      />
      {breakpoints.md ? (
        <Popover
          id={'journeys-sort-popover'}
          open={showSortBy}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
        >
          {sortByForm()}
        </Popover>
      ) : (
        <Drawer
          id={'journeys-sort-drawer'}
          anchor={'bottom'}
          open={showSortBy}
          onClose={handleClose}
        >
          {sortByForm()}
        </Drawer>
      )}
    </>
  )
}

export default JourneySort
