import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { useActionCommand } from '../../../../../../../utils/useActionCommand'

export function LinkAction(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const { addAction } = useActionCommand()
  const selectedBlock = stateSelectedBlock as TreeBlock<ButtonBlock> | undefined

  const linkAction =
    selectedBlock?.action?.__typename === 'LinkAction'
      ? selectedBlock.action
      : undefined

  // check for valid URL
  function checkURL(value?: string): boolean {
    const protocol = /^\w+:\/\//
    let urlInspect = value ?? ''
    if (!protocol.test(urlInspect)) {
      if (/^mailto:/.test(urlInspect)) return false
      urlInspect = `https://${urlInspect}`
    }
    try {
      return new URL(urlInspect).toString() !== ''
    } catch {
      return false
    }
  }

  const linkActionSchema = object({
    link: string()
      .required(t('Required'))
      .test('valid-url', t('Invalid URL'), checkURL)
  })

  function handleSubmit(src: string): void {
    if (selectedBlock == null || selectedStep == null) return

    // checks if url has a protocol
    const url = /^\w+:\/\//.test(src) ? src : `https://${src}`
    const { id, action, __typename: blockTypename } = selectedBlock
    addAction({
      blockId: id,
      blockTypename,
      action: {
        __typename: 'LinkAction',
        parentBlockId: id,
        gtmEventName: '',
        url,
        customizable: linkAction?.customizable ?? false,
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
        {t('Open new tab pointing to the provided URL.')}
      </Typography>
      <Box data-testid="LinkAction">
        <TextFieldForm
          id="link"
          label={t('Paste URL here...')}
          initialValue={linkAction?.url}
          validationSchema={linkActionSchema}
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
