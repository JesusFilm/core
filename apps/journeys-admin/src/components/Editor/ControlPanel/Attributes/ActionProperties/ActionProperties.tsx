import { ReactElement, useState } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import { Typography } from '@mui/material'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Stack from '@mui/material/Stack'
import { gql, useMutation } from '@apollo/client'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../__generated__/GetJourney'
import { NavigateActionUpdate } from '../../../../../../__generated__/NavigateActionUpdate'
import { useJourney } from '../../../../../libs/context'
import { NavigateNext } from './NavigateNext'
import { NavigateStep } from './NavigateStep'
import { NavigateJourney } from './NavigateJourney'
import { NavigateLink } from './NavigateLink'

export const NAVIGATE_ACTION_UPDATE = gql`
  mutation NavigateActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: NavigateActionInput!
  ) {
    blockUpdateNavigateAction(id: $id, journeyId: $journeyId, input: $input) {
      id
      ... on ButtonBlock {
        action {
          ... on NavigateAction {
            gtmEventName
          }
        }
      }
    }
  }
`

export enum actions {
  NavigateAction = 'Next Step',
  NavigateToBlockAction = 'Selected Card',
  NavigateToJourneyAction = 'Another Journey',
  LinkAction = 'URL/Website'
}

export function ActionProperties(): ReactElement {
  const { state } = useEditor()
  const journey = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [navigateActionUpdate] = useMutation<NavigateActionUpdate>(
    NAVIGATE_ACTION_UPDATE
  )

  const nextStep = state.steps.find(
    (step) => step.id === state.selectedStep?.nextBlockId
  )

  const actionName =
    selectedBlock?.action != null
      ? actions[selectedBlock?.action?.__typename]
      : 'Next Step'

  const [action, setAction] = useState(actionName)

  async function navigateAction(): Promise<void> {
    if (selectedBlock != null && nextStep != null) {
      await navigateActionUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { gtmEventName: 'gtmEventName' }
        }
        // optimistic response cache issues
        // optimisticResponse: {
        //   blockUpdateNavigateAction: {
        //     id: selectedBlock.id,
        //     __typename: 'ButtonBlock'
        //   }
        // }
      })
    }
  }

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    if (event.target.value === 'Next Step') {
      await navigateAction()
    }
    setAction(event.target.value)
  }

  return (
    <Stack sx={{ px: 6, pt: 4 }}>
      <FormControl variant="filled">
        <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
          Navigate to:
        </InputLabel>
        <Select
          onChange={handleChange}
          value={action}
          IconComponent={KeyboardArrowDownRoundedIcon}
        >
          {Object.values(actions).map((action) => {
            return (
              <MenuItem key={`button-action-${action}`} value={action}>
                {action}
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
      <Typography variant="caption" color="secondary.main" sx={{ pb: 8 }}>
        Redirect user to the selected resource
      </Typography>

      {action === actions.NavigateAction && <NavigateNext />}
      {action === actions.NavigateToBlockAction && <NavigateStep />}
      {action === actions.NavigateToJourneyAction && <NavigateJourney />}
      {action === actions.LinkAction && <NavigateLink />}
    </Stack>
  )
}
