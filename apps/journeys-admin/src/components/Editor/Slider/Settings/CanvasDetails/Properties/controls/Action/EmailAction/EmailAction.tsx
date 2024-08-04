import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Mail2Icon from '@core/shared/ui/icons/Mail2'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { useActionCommand } from '../../../../../../../utils/useActionCommand'

export function EmailAction(): ReactElement {
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

  async function handleSubmit(email: string): Promise<void> {
    if (selectedBlock != null) {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { id, action, __typename } = selectedBlock
      await addAction({
        blockId: id,
        blockTypename: __typename,
        action: {
          __typename: 'EmailAction',
          parentBlockId: id,
          gtmEventName: '',
          email
        },
        undoAction: action,
        editorFocus: {
          selectedStep,
          selectedBlock
        }
      })
    }
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
