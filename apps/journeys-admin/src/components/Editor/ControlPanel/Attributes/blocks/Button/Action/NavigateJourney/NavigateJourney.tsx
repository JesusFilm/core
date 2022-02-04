import { ReactElement, useState } from 'react'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'

export function NavigateJourney(): ReactElement {
  const [journeyName, setJourneyName] = useState('')

  // add query to get all journeys
  const journeysList = ['hello', 'world']

  function handleChange(event: SelectChangeEvent): void {
    setJourneyName(event.target.value)
  }

  return (
    <FormControl variant="filled" hiddenLabel>
      <Select displayEmpty onChange={handleChange} value={journeyName}>
        <MenuItem value="">Select the Journey...</MenuItem>
        {journeysList.map((journey) => (
          <MenuItem key={`button-navigate-journey-${journey}`} value="journey">
            {journey}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
