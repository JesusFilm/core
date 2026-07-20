import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement } from 'react'

import {
  AiChatSettings,
  toAiChatSettings,
  toCardBlockAiChatInput
} from '@core/journeys/ui/aiChatSettings'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'

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

  // The editor speaks in `enableAiChat` / `collapseChat`; the mapper bridges
  // to the legacy `showAssistant` / `expandChatByDefault` GraphQL fields.
  // Remove once NES-1735 renames the backend fields.
  const current = toAiChatSettings(cardBlock)

  function applyUpdate(settings: AiChatSettings): void {
    if (cardBlock == null) return
    dispatch({
      type: 'SetEditorFocusAction',
      activeSlide: ActiveSlide.Content,
      selectedStep,
      activeContent: ActiveContent.Canvas
    })
    const input = toCardBlockAiChatInput(settings)
    void cardBlockUpdate({
      variables: {
        id: cardBlock.id,
        input
      },
      optimisticResponse: {
        cardBlockUpdate: {
          id: cardBlock.id,
          __typename: 'CardBlock',
          ...input
        }
      }
    })
  }

  function handleEnableAiChatChange(
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ): void {
    const execute: AiChatSettings = {
      enableAiChat: checked,
      collapseChat: current.collapseChat
    }
    add({
      parameters: { execute, undo: current },
      execute(values: AiChatSettings) {
        applyUpdate(values)
      }
    })
  }

  function handleCollapseChatChange(
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ): void {
    const execute: AiChatSettings = {
      enableAiChat: current.enableAiChat,
      collapseChat: checked
    }
    add({
      parameters: { execute, undo: current },
      execute(values: AiChatSettings) {
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
              checked={current.enableAiChat}
              onChange={handleEnableAiChatChange}
            />
          }
          label={t('Enable AI chat')}
        />
        <Collapse in={current.enableAiChat} unmountOnExit>
          <Box sx={{ pl: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={current.collapseChat}
                  onChange={handleCollapseChatChange}
                />
              }
              label={t('Collapse chat')}
            />
          </Box>
        </Collapse>
      </Stack>
    </Box>
  )
}
