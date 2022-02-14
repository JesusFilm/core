import { ReactElement } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import MenuItem from '@mui/material/MenuItem'
import { gql, useQuery, useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { GetJourneyNames } from '../../../../../../../__generated__/GetJourneyNames'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { NavigateToJourneyActionUpdate } from '../../../../../../../__generated__/NavigateToJourneyActionUpdate'
import { useJourney } from '../../../../../../libs/context'

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
      id
      ... on ButtonBlock {
        action {
          ... on NavigateToJourneyAction {
            journeyId
          }
        }
      }
    }
  }
`

export function NavigateToJourneyAction(): ReactElement {
  const { state } = useEditor()
  const journey = useJourney()
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
    if (selectedBlock != null) {
      await navigateToJourneyActionUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { journeyId: event.target.value }
        }
        // optimistic response causing cache issues
        // optimisticResponse: {
        //   blockUpdateNavigateToJourneyAction: {
        //     id: selectedBlock.id,
        //     __typename: 'ButtonBlock',
        //     action: {
        //       __typename: 'NavigateToJourneyAction',
        //       journeyId: linkJourney.id
        //     }
        //   }
        // }
      })
      // setJourneyName(selectedJourney.title)
    }
  }

  return (
    <FormControl variant="filled" hiddenLabel>
      <Select
        displayEmpty
        onChange={handleChange}
        value={currentActionJourneyId}
        IconComponent={KeyboardArrowDownRoundedIcon}
        inputProps={{ 'aria-label': 'journey-name-select' }}
      >
        <MenuItem value="">Select the Journey...</MenuItem>
        {data?.journeys?.map(({ title, id }) => (
          <MenuItem key={`button-navigate-journey-${title}`} value={id}>
            {title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
