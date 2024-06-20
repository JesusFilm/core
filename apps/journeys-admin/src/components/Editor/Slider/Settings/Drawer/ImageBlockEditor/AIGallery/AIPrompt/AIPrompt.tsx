// import { gql, useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'

interface AIPromptProps {
  handleSubmit: ({ prompt }) => void
  loading?: boolean
  selectedBlock?: ImageBlock | null
}

interface AIPromptInput {
  prompt: string
}

export function AIPrompt({
  handleSubmit,
  loading,
  selectedBlock
}: AIPromptProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const promptValidationSchema = object({
    prompt: string().required(t('Prompt must be at least one character'))
  })

  const initialValues: AIPromptInput = {
    prompt:
      selectedBlock?.alt != null &&
      selectedBlock.alt.split(' ')[0] === 'Prompt:'
        ? selectedBlock?.alt.substring(8)
        : ''
  }

  return (
    <Stack sx={{ p: 6 }} data-testid="AIPrompt">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={promptValidationSchema}
      >
        {({
          values,
          errors,
          handleChange,
          handleSubmit,
          isValid,
          isSubmitting
        }) => (
          <Form>
            <TextField
              name="prompt"
              fullWidth
              data-testid="ai-prompt-field"
              id="outlined-textarea"
              multiline
              variant="filled"
              onChange={handleChange}
              disabled={isSubmitting}
              label={t('Prompt')}
              error={Boolean(errors.prompt)}
              value={values.prompt}
              helperText={<>{errors.prompt}</>}
              autoFocus
            />
            <Button
              fullWidth
              onClick={() => handleSubmit()}
              sx={{ mt: 4 }}
              disabled={!isValid || isSubmitting || loading}
              variant="outlined"
            >
              {t('Prompt')}
            </Button>
          </Form>
        )}
      </Formik>
    </Stack>
  )
}
