import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, RefObject } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Mail2Icon from '@core/shared/ui/icons/Mail2'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_ButtonBlock_action_EmailAction as ButtonBlockEmailAction
} from '../../../../../../../../../../__generated__/BlockFields'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { useActionCommand } from '../../../../../../../utils/useActionCommand'
import { TextFieldFormRef } from '../../../../../../../../TextFieldForm/TextFieldForm'

interface EmailActionProps {
  ref?: RefObject<TextFieldFormRef | null>
}

export function EmailAction({ ref }: EmailActionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const selectedBlock = stateSelectedBlock as TreeBlock<ButtonBlock> | undefined

  const { addAction } = useActionCommand()

  const emailAction =
    selectedBlock?.action?.__typename === 'EmailAction'
      ? selectedBlock.action
      : undefined

  const emailActionSchema = object({
    email: string()
      .required(t('Invalid Email'))
      .email(t('Email must be a valid email'))
  })

  function handleSubmit(email: string): void {
    if (selectedBlock == null || selectedStep == null) return
    const { id, action, __typename: blockTypename } = selectedBlock
    addAction({
      blockId: id,
      blockTypename,
      action: {
        __typename: 'EmailAction',
        parentBlockId: id,
        gtmEventName: '',
        email,
        customizable:
          (selectedBlock?.action as ButtonBlockEmailAction)?.customizable ??
          false,
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
        {t('Open client with the provided email in the to field.')}
      </Typography>
      <Box data-testid="EmailAction">
        <TextFieldForm
          id="email"
          ref={ref}
          label={t('Paste Email here...')}
          initialValue={emailAction?.email}
          validationSchema={emailActionSchema}
          onSubmit={handleSubmit}
          startIcon={
            <InputAdornment position="start">
              <Mail2Icon />
            </InputAdornment>
          }
        />
      </Box>
    </>
  )
}
