import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { object, string } from 'yup'

interface StudyQuestionFormProps {
  initialValues: {
    value: string
  }
  onSubmit: (values: { value: string }) => Promise<void>
  loading?: boolean
  variant?: 'create' | 'edit'
}

export function StudyQuestionForm({
  initialValues,
  onSubmit,
  loading = false,
  variant = 'create'
}: StudyQuestionFormProps): ReactElement {
  const t = useTranslations()

  const validationSchema = object().shape({
    value: string().required(t('Study question is required'))
  })

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      {({ values, errors, handleChange, isValid, isSubmitting, dirty }) => (
        <Form>
          <Stack gap={3}>
            <TextField
              id="value"
              name="value"
              placeholder={t('Enter study question')}
              fullWidth
              multiline
              minRows={3}
              maxRows={10}
              value={values.value}
              variant="outlined"
              error={Boolean(errors.value)}
              onChange={handleChange}
              helperText={errors.value}
              autoFocus
              sx={{
                '& .MuiInputBase-root': {
                  height: 'auto'
                }
              }}
            />
            <Stack direction="row" gap={2} justifyContent="flex-end">
              <Button
                type="submit"
                variant="outlined"
                color="secondary"
                disabled={!isValid || !dirty || isSubmitting || loading}
              >
                {variant === 'create' ? t('Add') : t('Update')}
              </Button>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}
