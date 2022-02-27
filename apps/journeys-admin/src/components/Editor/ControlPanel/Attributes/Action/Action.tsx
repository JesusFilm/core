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
import { ActionRemove } from '../../../../../../__generated__/ActionRemove'
import { useJourney } from '../../../../../libs/context'
import { NavigateAction } from './NavigateAction'
import { NavigateToBlockAction } from './NavigateToBlockAction'
import { NavigateToJourneyAction } from './NavigateToJourneyAction'
import { LinkAction } from './LinkAction'

export const NAVIGATE_ACTION_UPDATE = gql`
  mutation NavigateActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: NavigateActionInput!
  ) {
    blockUpdateNavigateAction(id: $id, journeyId: $journeyId, input: $input) {
      gtmEventName
    }
  }
`

export const ACTION_REMOVE = gql`
  mutation ActionRemove($id: ID!, $journeyId: ID!) {
    blockDeleteAction(id: $id, journeyId: $journeyId) {
      id
    }
  }
`
// convert this to array of obects, add one for the none option
export enum actions {
  NavigateAction = 'Next Step',
  NavigateToBlockAction = 'Selected Card',
  NavigateToJourneyAction = 'Another Journey',
  LinkAction = 'URL/Website'
}

export function Action(): ReactElement {
  const { state } = useEditor()
  const journey = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [navigateActionUpdate] = useMutation<NavigateActionUpdate>(
    NAVIGATE_ACTION_UPDATE
  )
  const [actionRemove] = useMutation<ActionRemove>(ACTION_REMOVE)

  const actionName =
    selectedBlock?.action != null
      ? actions[selectedBlock?.action?.__typename]
      : 'none'

  const [action, setAction] = useState(actionName)

  async function navigateAction(): Promise<void> {
    if (selectedBlock != null && state.selectedStep?.nextBlockId != null) {
      const { id, __typename: typeName } = selectedBlock
      await navigateActionUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {}
        },
        update(cache, { data }) {
          if (data?.blockUpdateNavigateAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: typeName,
                id
              }),
              fields: {
                action: () => data.blockUpdateNavigateAction
              }
            })
          }
        }
      })
    }
  }

  async function removeAction(): Promise<void> {
    if (selectedBlock != null) {
      const { id, __typename: typeName } = selectedBlock
      await actionRemove({
        variables: {
          id,
          journeyId: journey.id
        },
        update(cache, { data }) {
          if (data?.blockDeleteAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: typeName,
                id
              }),
              fields: {
                action: () => null
              }
            })
          }
        }
      })
    }
  }

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    if (event.target.value === 'none') {
      await removeAction()
    } else if (event.target.value === 'Next Step') {
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
          <MenuItem value={'none'}>Select an Action...</MenuItem>
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

      {action === actions.NavigateAction && <NavigateAction />}
      {action === actions.NavigateToBlockAction && <NavigateToBlockAction />}
      {action === actions.NavigateToJourneyAction && (
        <NavigateToJourneyAction />
      )}
      {action === actions.LinkAction && <LinkAction />}
    </Stack>
  )
}
