import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  CardBlockChatAssistantUpdate,
  CardBlockChatAssistantUpdateVariables
} from '../../../../../../../../../../__generated__/CardBlockChatAssistantUpdate'

export const CARD_BLOCK_CHAT_ASSISTANT_UPDATE = gql`
  mutation CardBlockChatAssistantUpdate(
    $id: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, input: $input) {
      id
      showAssistant
      expandChatByDefault
    }
  }
`

interface ChatAssistantValues {
  showAssistant: boolean
  expandChatByDefault: boolean
}

export function ChatAssistant(): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  const [cardBlockUpdate] = useMutation<
    CardBlockChatAssistantUpdate,
    CardBlockChatAssistantUpdateVariables
  >(CARD_BLOCK_CHAT_ASSISTANT_UPDATE)

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardBlock> | undefined

  if (cardBlock == null) return null

  const currentShowAssistant = cardBlock.showAssistant === true
  const currentExpandChatByDefault = cardBlock.expandChatByDefault === true

  function applyUpdate(values: ChatAssistantValues): void {
    if (cardBlock == null) return
    dispatch({ type: 'SetEditorFocusAction', selectedStep })
    void cardBlockUpdate({
      variables: {
        id: cardBlock.id,
        input: {
          showAssistant: values.showAssistant,
          expandChatByDefault: values.expandChatByDefault
        }
      },
      optimisticResponse: {
        cardBlockUpdate: {
          id: cardBlock.id,
          __typename: 'CardBlock',
          showAssistant: values.showAssistant,
          expandChatByDefault: values.expandChatByDefault
        }
      }
    })
  }

  function handleShowAssistantChange(
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ): void {
    const nextExpand = checked ? currentExpandChatByDefault : false
    const execute: ChatAssistantValues = {
      showAssistant: checked,
      expandChatByDefault: nextExpand
    }
    const undo: ChatAssistantValues = {
      showAssistant: currentShowAssistant,
      expandChatByDefault: currentExpandChatByDefault
    }
    add({
      parameters: { execute, undo },
      execute(values: ChatAssistantValues) {
        applyUpdate(values)
      }
    })
  }

  function handleExpandChatByDefaultChange(
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ): void {
    const execute: ChatAssistantValues = {
      showAssistant: currentShowAssistant,
      expandChatByDefault: checked
    }
    const undo: ChatAssistantValues = {
      showAssistant: currentShowAssistant,
      expandChatByDefault: currentExpandChatByDefault
    }
    add({
      parameters: { execute, undo },
      execute(values: ChatAssistantValues) {
        applyUpdate(values)
      }
    })
  }

  return (
    <Box sx={{ px: 4, py: 2 }} data-testid="ChatAssistant">
      <Stack spacing={1}>
        <FormControlLabel
          control={
            <Switch
              checked={currentShowAssistant}
              onChange={handleShowAssistantChange}
              inputProps={{ 'aria-label': t('Show AI chat') }}
            />
          }
          label={t('Show AI chat')}
        />
        <Collapse in={currentShowAssistant} unmountOnExit>
          <Box sx={{ pl: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentExpandChatByDefault}
                  onChange={handleExpandChatByDefaultChange}
                  inputProps={{ 'aria-label': t('Open chat automatically') }}
                />
              }
              label={t('Open chat automatically')}
            />
          </Box>
        </Collapse>
      </Stack>
    </Box>
  )
}
