import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Iphone1Icon from '@core/shared/ui/icons/Iphone1'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { useActionCommand } from '../../../../../../../utils/useActionCommand'
import { CountryCodeAutoComplete } from './CountryCodeAutoComplete'
import Stack from '@mui/material/Stack'

export function PhoneAction(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const selectedBlock = stateSelectedBlock as TreeBlock<ButtonBlock> | undefined

  const { addAction } = useActionCommand()

  const phoneAction =
    selectedBlock?.action?.__typename === 'PhoneAction'
      ? selectedBlock.action
      : undefined

  const phoneActionSchema = object({
    phone: string()
      .required(t('Invalid Phone Number'))
      .matches(/^\+?[1-9]\d{1,14}$/, t('Phone number must be a valid format'))
  })

  function handleSubmit(phone: string): void {
    if (selectedBlock == null) return

    const { id, action, __typename: blockTypename } = selectedBlock
    addAction({
      blockId: id,
      blockTypename,
      action: {
        __typename: 'PhoneAction',
        parentBlockId: id,
        gtmEventName: '',
        phone
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
        {t('Open phone dialer with the provided phone number.')}
      </Typography>
      <Stack data-testid="PhoneAction" direction="row" spacing={2}>
        <CountryCodeAutoComplete />
        <TextFieldForm
          id="phone"
          hiddenLabel
          placeholder="999999999"
          initialValue={phoneAction?.phone}
          validationSchema={phoneActionSchema}
          onSubmit={handleSubmit}
        />
      </Stack>
    </>
  )
}
