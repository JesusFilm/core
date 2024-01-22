import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { Form, Formik, FormikHelpers } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { InferType, object, string } from 'yup'

import { PageProps } from '../types'

export function PasswordResetPage({
  userEmail,
  setUserEmail,
  setActivePage
}: PageProps): ReactElement {
  const auth = getAuth()
  const { t } = useTranslation()
  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Please enter your email address'))
  })

  async function PasswordReset(
    values: InferType<typeof validationSchema>,
    { setFieldError }: FormikHelpers<InferType<typeof validationSchema>>
  ): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, values.email)
      if (setActivePage != null && setUserEmail != null) {
        setUserEmail(values.email)
        setActivePage('reset')
      }
    } catch (error) {
      setFieldError(
        'email',
        t('An error occurred: {{message}}', { message: error.message })
      )
    }
  }

  return (
    <>
      <Formik
        initialValues={{ email: userEmail }}
        validationSchema={validationSchema}
        onSubmit={PasswordReset}
      >
        {({
          values,
          handleChange,
          handleBlur,
          errors,
          touched,
          isValid,
          isSubmitting
        }) => (
          <Form>
            <Stack gap={4}>
              <Typography variant="h6" textAlign="left">
                {t('Reset Password')}
              </Typography>
              <Typography textAlign="left">
                {t(
                  'Get instructions sent to this email that explain how to reset your password.'
                )}
              </Typography>
              <TextField
                autoComplete="on"
                name="email"
                label="Email"
                placeholder={t('Enter your email address here')}
                variant="filled"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email != null && touched.email != null}
                helperText={
                  touched?.email != null && errors.email != null && errors.email
                }
                fullWidth
              />
              <Stack direction="row" spacing={2}>
                <Button
                  size="large"
                  fullWidth
                  onClick={() => setActivePage?.('password')}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  color="secondary"
                  type="submit"
                  disabled={!isValid || isSubmitting}
                >
                  {t('Send')}
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  )
}
