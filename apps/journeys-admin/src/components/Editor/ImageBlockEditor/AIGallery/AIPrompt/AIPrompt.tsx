// import { gql, useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

interface AIPromptProps {
  handleSubmit: ({ prompt }) => void
  loading?: boolean
}

interface AIPromptInput {
  prompt: string
}

export function AIPrompt({
  handleSubmit,
  loading
}: AIPromptProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const promptValidationSchema = object({
    prompt: string().required(t('Prompt must be at least one character'))
  })

  const initialValues: AIPromptInput = { prompt: '' }

  return (
    <Stack sx={{ p: 6 }}>
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
              label="Prompt"
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
              Prompt
            </Button>
          </Form>
        )}
      </Formik>
    </Stack>
  )
}
