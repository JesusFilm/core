import { ReactElement, useState } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import MenuItem from '@mui/material/MenuItem'
import { gql, useQuery } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { GetJourneysNames } from '../../../../../../../../../__generated__/GetJourneysNames'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'

const GET_JOURNEYS_NAMES = gql`
  query GetJourneysNames {
    journeys: adminJourneys {
      id
      title
    }
  }
`

export function NavigateJourney(): ReactElement {
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const { data } = useQuery<GetJourneysNames>(GET_JOURNEYS_NAMES)

  const currentActionTitle =
    data?.journeys.find(({ id }) => id === selectedBlock?.id)?.title ?? ''

  const [journeyName, setJourneyName] = useState(currentActionTitle)
  const journeysList = data?.journeys

  function handleChange(event: SelectChangeEvent): void {
    // Add backend update
    setJourneyName(event.target.value)
  }

  return (
    <FormControl variant="filled" hiddenLabel>
      <Select displayEmpty onChange={handleChange} value={journeyName}>
        <MenuItem value="">Select the Journey...</MenuItem>
        {journeysList?.map(({ title }) => (
          <MenuItem key={`button-navigate-journey-${title}`} value={title}>
            {title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
