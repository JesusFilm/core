import { gql, useMutation, useQuery } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { GetJourneyNames } from '../../../../../../../__generated__/GetJourneyNames'
import { NavigateToJourneyActionUpdate } from '../../../../../../../__generated__/NavigateToJourneyActionUpdate'

export const GET_JOURNEY_NAMES = gql`
  query GetJourneyNames {
    journeys: adminJourneys {
      id
      title
    }
  }
`

export const NAVIGATE_TO_JOURNEY_ACTION_UPDATE = gql`
  mutation NavigateToJourneyActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: NavigateToJourneyActionInput!
  ) {
    blockUpdateNavigateToJourneyAction(
      id: $id
      journeyId: $journeyId
      input: $input
    ) {
      gtmEventName
      journey {
        id
        slug
      }
    }
  }
`

export function NavigateToJourneyAction(): ReactElement {
  const { state } = useEditor()
  const { journey } = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const { data } = useQuery<GetJourneyNames>(GET_JOURNEY_NAMES)

  const [navigateToJourneyActionUpdate] =
    useMutation<NavigateToJourneyActionUpdate>(
      NAVIGATE_TO_JOURNEY_ACTION_UPDATE
    )

  const currentActionJourneyId =
    data?.journeys.find(
      ({ id }) =>
        selectedBlock?.action?.__typename === 'NavigateToJourneyAction' &&
        id === selectedBlock?.action?.journey?.id
    )?.id ?? ''

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    if (selectedBlock != null && journey != null) {
      const { id, __typename: typeName } = selectedBlock
      await navigateToJourneyActionUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: { journeyId: event.target.value }
        },
        update(cache, { data }) {
          if (data?.blockUpdateNavigateToJourneyAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: typeName,
                id
              }),
              fields: {
                action: () => data.blockUpdateNavigateToJourneyAction
              }
            })
          }
        }
      })
    }
  }

  return (
    <FormControl variant="filled" hiddenLabel sx={{ pt: 8 }}>
      <Select
        displayEmpty
        onChange={handleChange}
        value={currentActionJourneyId}
        IconComponent={ChevronDownIcon}
        inputProps={{ 'aria-label': 'journey' }}
      >
        <MenuItem value="">Select the Journey...</MenuItem>
        {data?.journeys?.map(({ title, id }) => (
          <MenuItem key={`button-navigate-journey-${id}`} value={id}>
            {title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
