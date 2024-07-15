import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import Mail2Icon from '@core/shared/ui/icons/Mail2'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { useEmailActionUpdateMutation } from '../../../../../../../../../libs/useEmailActionUpdateMutation/useEmailActionUpdateMutation'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'

export function EmailAction(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { state } = useEditor()
  const { journey } = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [emailActionUpdate] = useEmailActionUpdateMutation()

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
    if (selectedBlock != null && journey != null) {
      const { id } = selectedBlock
      await emailActionUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            email
          }
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
