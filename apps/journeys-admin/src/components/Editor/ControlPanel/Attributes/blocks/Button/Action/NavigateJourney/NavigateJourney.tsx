import { ReactElement, useState } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { gql, useQuery } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { GetJourneysNames } from '../../../../../../../../../__generated__/GetJourneysNames'

const GET_JOURNEYS_NAMES = gql`
  query GetJourneysNames {
    journeys: adminJourneys {
      id
      title
    }
  }
`

export function NavigateJourney(): ReactElement {
  const { data } = useQuery<GetJourneysNames>(GET_JOURNEYS_NAMES)
  const [journeyName, setJourneyName] = useState('')

  // add query to get all journeys
  // const journeysList = ['hello', 'world']
  const journeysList = data.journeys
  console.log(journeysList)

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
