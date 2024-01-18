import MailOutlineIcon from '@mui/icons-material/MailOutline'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { fetchSignInMethodsForEmail, getAuth } from 'firebase/auth'
import { Form, Formik } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { InferType, object, string } from 'yup'

import type { ActivePage } from '../SignIn'
import { SignInServiceButton } from '../SignInServiceButton'

export interface PageProps {
  userEmail?: string
  setUserEmail?: (userEmail: string) => void
  activePage?: ActivePage
  setActivePage: (activePage: ActivePage) => void
  variant?: 'Google' | 'Facebook'
}

export function HomePage({
  setActivePage,
  setUserEmail
}: PageProps): ReactElement {
  const { t } = useTranslation()
  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Please enter your email address'))
  })
  async function handleEmailSignIn(
    values: InferType<typeof validationSchema>
  ): Promise<void> {
    const auth = getAuth()
    const result = await fetchSignInMethodsForEmail(auth, values.email)
    if (result.length === 0) {
      setActivePage('register')
    } else {
      switch (result[0]) {
        case 'password':
          setActivePage('password')
          break
        case 'google.com':
          setActivePage('google.com')
          break
        case 'facebook.com':
          setActivePage('facebook.com')
          break
        default:
          break
      }
    }
    if (setUserEmail != null) {
      setUserEmail(values.email)
    }
  }
  return (
    <>
      <Box>
        <Typography variant="h6" textAlign="center" gutterBottom>
          {t('Log in or Sign up')}
        </Typography>
        <Typography variant="body2" textAlign="center">
          {t("No account? We'll create one for you automatically.")}
        </Typography>
      </Box>
      <SignInServiceButton variant="Google" />
      <SignInServiceButton variant="Facebook" />
      <Divider>{t('OR')}</Divider>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={handleEmailSignIn}
        validationSchema={validationSchema}
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
          <Form noValidate autoComplete="off" data-testid="EmailSignInForm">
            <Stack gap={4}>
              <TextField
                autoComplete="on"
                name="email"
                hiddenLabel
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
              <Button
                variant="contained"
                size="large"
                fullWidth
                color="secondary"
                startIcon={<MailOutlineIcon />}
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {t('Sign in with email')}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  )
}
