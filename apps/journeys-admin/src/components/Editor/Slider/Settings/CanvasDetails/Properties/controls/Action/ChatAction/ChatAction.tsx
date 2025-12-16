import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, RefObject } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_ButtonBlock_action_ChatAction as ButtonBlockChatAction
} from '../../../../../../../../../../__generated__/BlockFields'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { TextFieldFormRef } from '../../../../../../../../TextFieldForm/TextFieldForm'
import { useActionCommand } from '../../../../../../../utils/useActionCommand'

interface ChatActionProps {
  ref?: RefObject<TextFieldFormRef | null>
}

export function ChatAction({ ref }: ChatActionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const { addAction } = useActionCommand()
  const selectedBlock = stateSelectedBlock as TreeBlock<ButtonBlock> | undefined

  const chatAction =
    (selectedBlock as ButtonBlock)?.action?.__typename === 'ChatAction'
      ? ((selectedBlock as ButtonBlock).action as ButtonBlockChatAction)
      : undefined

  // check for valid URL
  function checkURL(value?: string): boolean {
    const protocol = /^\w+:\/\//
    let urlInspect = value ?? ''
    if (!protocol.test(urlInspect)) {
      urlInspect = `https://${urlInspect}`
    }
    try {
      return new URL(urlInspect).toString() !== ''
    } catch {
      return false
    }
  }

  const chatActionSchema = object({
    chatUrl: string()
      .required(t('Required'))
      .test('valid-url', t('Invalid URL'), checkURL)
  })

  function handleSubmit(chatUrl: string): void {
    if (selectedBlock == null || selectedStep == null) return
    // checks if url has a protocol
    const url = /^\w+:\/\//.test(chatUrl) ? chatUrl : `https://${chatUrl}`
    const {
      id,
      action,
      __typename: blockTypename
    } = selectedBlock as ButtonBlock
    addAction({
      blockId: id,
      blockTypename,
      action: {
        __typename: 'ChatAction',
        parentBlockId: id,
        gtmEventName: '',
        chatUrl: url,
        customizable:
          ((selectedBlock as ButtonBlock)?.action as ButtonBlockChatAction)
            ?.customizable ?? false,
        parentStepId: selectedStep.id
      },
      undoAction: action,
      editorFocus: {
        selectedStep,
        selectedBlock
      }
    })
  }

  return (
    <>
      <Typography
        variant="caption"
        color="secondary.main"
        sx={{ mt: 1, mb: 3 }}
      >
        {t('Start a chat with the provided URL.')}
      </Typography>
      <Box data-testid="ChatAction">
        <TextFieldForm
          id="chatUrl"
          ref={ref}
          label={t('Paste chat URL here...')}
          initialValue={chatAction?.chatUrl}
          validationSchema={chatActionSchema}
          helperText={t('e.g. WhatsApp, Messenger, Telegram')}
          onSubmit={handleSubmit}
          startIcon={
            <InputAdornment position="start">
              <LinkIcon />
            </InputAdornment>
          }
        />
      </Box>
    </>
  )
}
