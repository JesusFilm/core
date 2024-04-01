import MailOutlineIcon from '@mui/icons-material/MailOutline'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { fetchSignInMethodsForEmail, getAuth } from 'firebase/auth'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { InferType, object, string } from 'yup'

import { SignInServiceButton } from '../SignInServiceButton'
import { SignInTabs } from '../SignInTabs'
import { PageProps } from '../types'

export function HomePage({
  setActivePage,
  setUserEmail,
  setUserPassword
}: PageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Please enter your email address')),
    password: string().min(6)
  })
  async function handleEmailSignIn(
    values: InferType<typeof validationSchema>
  ): Promise<void> {
    const auth = getAuth()
    const result = await fetchSignInMethodsForEmail(auth, values.email)
    if (result.length === 0) {
      setActivePage?.('register')
    } else {
      switch (result[0]) {
        case 'password':
          setActivePage?.('password')
          break
        case 'google.com':
          setActivePage?.('google.com')
          break
        case 'facebook.com':
          setActivePage?.('facebook.com')
          break
        default:
          break
      }
    }
    setUserEmail?.(values.email)
    setUserPassword?.(values.password ?? '')
  }
  return (
    <>
      <Box sx={{ pb: 3 }}>
        <SignInTabs />
      </Box>
      <Stack spacing={3}>
        <SignInServiceButton service="google.com" />
        <SignInServiceButton service="facebook.com" />
      </Stack>
      <Divider sx={{ my: 3 }}>{t('OR')}</Divider>
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
          <Form data-testid="EmailSignInForm">
            <Stack gap={4}>
              <div>
                <TextField
                  id="username"
                  type="email"
                  autoComplete="username"
                  name="email"
                  hiddenLabel
                  placeholder={t('Enter your email address here')}
                  variant="filled"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email != null && touched.email != null}
                  helperText={
                    touched?.email != null &&
                    errors.email != null &&
                    errors.email
                  }
                  fullWidth
                />
                <input
                  aria-label="password-input"
                  tabIndex={-1}
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  name="password"
                  style={{
                    display: 'block',
                    opacity: 0,
                    height: 0,
                    padding: 0,
                    border: 0
                  }}
                  onChange={handleChange}
                />
              </div>
              <Button
                variant="contained"
                size="large"
                fullWidth
                color="secondary"
                startIcon={<MailOutlineIcon />}
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {t('Continue with email')}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  )
}
