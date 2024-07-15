import { gql, useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { ActionDelete } from '../../../../../../../../../__generated__/ActionDelete'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_FormBlock as FormBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { BLOCK_UPDATE_ACTION_FIELDS } from '@core/journeys/ui/action/actionFields'
import { useEmailActionUpdateMutation } from '../../../../../../../../libs/useEmailActionUpdateMutation'
import { useLinkActionUpdateMutation } from '../../../../../../../../libs/useLinkActionUpdateMutation'
import { useNavigateToBlockActionUpdateMutation } from '../../../../../../../../libs/useNavigateToBlockActionUpdateMutation'
import { EmailAction } from './EmailAction'
import { LinkAction } from './LinkAction'
import { NavigateToBlockAction } from './NavigateToBlockAction'
import { ActionValue, actions } from './utils/actions'

export const ACTION_DELETE = gql`
  ${BLOCK_UPDATE_ACTION_FIELDS}
  mutation ActionDelete($id: ID!, $journeyId: ID!) {
    blockDeleteAction(id: $id, journeyId: $journeyId) {
      id
      ...BlockUpdateActionFields
    }
  }
`

export function Action(): ReactElement {
  const { state } = useEditor()
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const { add } = useCommand()

  // Add addtional types here to use this component for that block
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | TreeBlock<FormBlock>
    | TreeBlock<SignUpBlock>
    | TreeBlock<VideoBlock>
    | undefined
  const [actionDelete] = useMutation<ActionDelete>(ACTION_DELETE)
  const [linkActionUpdate] = useLinkActionUpdateMutation()
  const [emailActionUpdate] = useEmailActionUpdateMutation()
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const labels = actions(t)
  const [action, setAction] = useState<ActionValue>(
    selectedBlock?.action?.__typename ?? 'None'
  )

  useEffect(() => {
    setAction(selectedBlock?.action?.__typename ?? 'None')
  }, [selectedBlock?.action?.__typename])

  async function removeAction(): Promise<void> {
    if (journey != null && selectedBlock?.action != null) {
      const { id, action } = selectedBlock
      add({
        parameters: {
          execute: {
            id,
            journeyId: journey.id
          },
          undo: {
            id,
            journeyId: journey.id,
            action
          }
        },
        async execute({ id, journeyId }) {
          await actionDelete({
            variables: {
              id,
              journeyId
            }
          })
        },
        async undo({ id, journeyId, action }) {
          switch (action.__typename) {
            case 'LinkAction':
              await linkActionUpdate({
                variables: {
                  id,
                  journeyId,
                  input: {
                    url: action.url
                  }
                }
              })
              break
            case 'EmailAction':
              await emailActionUpdate({
                variables: {
                  id,
                  journeyId,
                  input: {
                    email: action.email
                  }
                }
              })
              break
            case 'NavigateToBlockAction':
              await navigateToBlockActionUpdate({
                variables: {
                  id,
                  journeyId,
                  input: {
                    blockId: action.blockId
                  }
                }
              })
          }
        }
      })
    }
  }

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    if (event.target.value === 'None') await removeAction()
    setAction(event.target.value as ActionValue)
  }

  return (
    <>
      <Stack sx={{ p: 4, pt: 0 }} data-testid="Action">
        <FormControl variant="filled">
          <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
            {t('Navigate to:')}
          </InputLabel>

          <Select
            onChange={handleChange}
            value={action}
            IconComponent={ChevronDownIcon}
          >
            {labels.map((action) => {
              return (
                <MenuItem
                  key={`button-action-${action.value}`}
                  value={action.value}
                >
                  {t(action.label)}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        {action === 'LinkAction' && <LinkAction />}
        {action === 'EmailAction' && <EmailAction />}
        {action === 'NavigateToBlockAction' && <NavigateToBlockAction />}
      </Stack>
    </>
  )
}
