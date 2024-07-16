import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import LinkIcon from '@core/shared/ui/icons/Link'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { useBlockActionLinkUpdateMutation } from '../../../../../../../../../libs/useBlockActionLinkUpdateMutation'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { useActionCommand } from '../utils/useActionCommand'

export function LinkAction(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { state } = useEditor()
  const { addAction } = useActionCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

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
    } catch (error) {
      return false
    }
  }

  const linkActionSchema = object({
    link: string()
      .required(t('Required'))
      .test('valid-url', t('Invalid URL'), checkURL)
  })

  async function handleSubmit(src: string): Promise<void> {
    // checks if url has a protocol
    const url = /^\w+:\/\//.test(src) ? src : `https://${src}`
    if (selectedBlock != null) {
      const { id, action, __typename } = selectedBlock
      await addAction({
        blockId: id,
        blockTypename: __typename,
        action: {
          __typename: 'LinkAction',
          parentBlockId: id,
          gtmEventName: '',
          url
        },
        undoAction: action
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
