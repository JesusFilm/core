import { ReactElement, useState, useEffect } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import MenuItem from '@mui/material/MenuItem'
import { gql, useQuery, useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { GetJourneysNames } from '../../../../../../../../../__generated__/GetJourneysNames'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'
import { NavigateToJourneyActionUpdate } from '../../../../../../../../../__generated__/NavigateToJourneyActionUpdate'
import { useJourney } from '../../../../../../../../libs/context'

export const GET_JOURNEYS_NAMES = gql`
  query GetJourneysNames {
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

export function NavigateJourney(): ReactElement {
  const { state } = useEditor()
  const journey = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const { data } = useQuery<GetJourneysNames>(GET_JOURNEYS_NAMES)

  const [navigateToJourneyActionUpdate] =
    useMutation<NavigateToJourneyActionUpdate>(
      NAVIGATE_TO_JOURNEY_ACTION_UPDATE
    )

  const currentActionTitle =
    data?.journeys.find(
      ({ id }) =>
        selectedBlock?.action?.__typename === 'NavigateToJourneyAction' &&
        id === selectedBlock?.action?.journey?.id
    )?.title ?? ''

  const journeysList = data?.journeys
  const [journeyName, setJourneyName] = useState('')

  useEffect(() => {
    setJourneyName(currentActionTitle)
  }, [currentActionTitle])

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    const linkJourney = data?.journeys.find(
      ({ title }) => title === event.target.value
    )
    if (selectedBlock != null && linkJourney != null) {
      await navigateToJourneyActionUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { journeyId: linkJourney.id }
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
    }
    setJourneyName(event.target.value)
  }

  return (
    <FormControl variant="filled" hiddenLabel>
      <Select
        displayEmpty
        onChange={handleChange}
        value={journeyName}
        IconComponent={KeyboardArrowDownRoundedIcon}
      >
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
