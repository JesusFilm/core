import { gql, useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { ActionDelete } from '../../../../../../__generated__/ActionDelete'
import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey_blocks_FormBlock as FormBlock,
  GetJourney_journey_blocks_SignUpBlock as SignUpBlock,
  GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../__generated__/GetJourney'
import { NavigateActionUpdate } from '../../../../../../__generated__/NavigateActionUpdate'

import { EmailAction } from './EmailAction'
import { LinkAction } from './LinkAction'
import { NavigateAction } from './NavigateAction'
import { NavigateToBlockAction } from './NavigateToBlockAction'
import { NavigateToJourneyAction } from './NavigateToJourneyAction'
import { getNextStep } from './utils/getNextStep'

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

export const ACTION_DELETE = gql`
  mutation ActionDelete($id: ID!, $journeyId: ID!) {
    blockDeleteAction(id: $id, journeyId: $journeyId) {
      id
    }
  }
`
export const actions = [
  {
    value: 'none',
    label: 'None'
  },
  {
    value: 'NavigateAction',
    label: 'Next Step'
  },
  {
    value: 'NavigateToBlockAction',
    label: 'Selected Card'
  },
  {
    value: 'LinkAction',
    label: 'URL/Website'
  },
  {
    value: 'EmailAction',
    label: 'Email'
  }
]

export function Action(): ReactElement {
  const { state } = useEditor()
  const { journey } = useJourney()

  // Add addtional types here to use this component for that block
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | TreeBlock<FormBlock>
    | TreeBlock<SignUpBlock>
    | TreeBlock<TextResponseBlock>
    | TreeBlock<VideoBlock>
    | undefined

  const [navigateActionUpdate] = useMutation<NavigateActionUpdate>(
    NAVIGATE_ACTION_UPDATE
  )
  const [actionDelete] = useMutation<ActionDelete>(ACTION_DELETE)

  const selectedAction = actions.find(
    (act) => act.value === selectedBlock?.action?.__typename
  )

  const [action, setAction] = useState(selectedAction?.value ?? 'none')
  const nextStep = getNextStep(state?.selectedStep, state?.steps)

  useEffect(() => {
    if (selectedAction != null) {
      setAction(selectedAction.value)
    } else {
      setAction('none')
    }
  }, [selectedBlock, selectedAction])

  async function navigateAction(): Promise<void> {
    if (
      selectedBlock != null &&
      (state.selectedStep?.nextBlockId != null || nextStep != null) &&
      journey != null
    ) {
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
    if (selectedBlock != null && journey != null) {
      const { id, __typename: typeName } = selectedBlock
      await actionDelete({
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
    } else if (event.target.value === 'NavigateAction') {
      await navigateAction()
    }
    setAction(event.target.value)
  }

  return (
    <>
      <Stack sx={{ pt: 4, px: 6 }} data-testid="Action">
        <FormControl variant="filled">
          <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
            Navigate to:
          </InputLabel>

          <Select
            onChange={handleChange}
            value={action}
            IconComponent={ChevronDownIcon}
          >
            {actions.map((action) => {
              return (
                <MenuItem
                  key={`button-action-${action.value}`}
                  value={action.value}
                  disabled={
                    nextStep == null && action.value === 'NavigateAction'
                  }
                >
                  {action.label}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>

        <Typography variant="caption" color="secondary.main">
          Redirect user to the selected resource
        </Typography>
        {action === 'NavigateAction' && <NavigateAction />}
        {action === 'LinkAction' && <LinkAction />}
        {action === 'NavigateToJourneyAction' && <NavigateToJourneyAction />}
        {action === 'EmailAction' && <EmailAction />}
      </Stack>
      {action === 'NavigateToBlockAction' && <NavigateToBlockAction />}
    </>
  )
}
