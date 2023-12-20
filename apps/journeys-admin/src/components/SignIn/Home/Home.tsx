import MailOutlineIcon from '@mui/icons-material/MailOutline'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { fetchSignInMethodsForEmail, getAuth } from 'firebase/auth'
import { Form, Formik, FormikHelpers } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { InferType, object, string } from 'yup'

import { FacebookButton } from '../FacebookButton'
import { GoogleButton } from '../GoogleButton'
import type { ActivePage } from '../SignIn'

interface HomeProps {
  setActivePage: (activePage: ActivePage) => void
  setEmail: (email: string) => void
}
export function Home({ setActivePage, setEmail }: HomeProps): ReactElement {
  const { t } = useTranslation()
  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Required'))
  })
  async function handleEmailSignIn(
    values: InferType<typeof validationSchema>,
    actions: FormikHelpers<InferType<typeof validationSchema>>
  ): Promise<void> {
    const auth = getAuth()
    const result = await fetchSignInMethodsForEmail(auth, values.email)
    console.log(result)
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
    setEmail(values.email)
  }
  return (
    <>
      <Box>
        <Typography variant="h5" textAlign="center" gutterBottom>
          {t('Log in or Sign up')}
        </Typography>
        <Typography variant="body2" textAlign="center">
          {t("No account? We'll create one for you automatically.")}
        </Typography>
      </Box>
      <GoogleButton />
      <FacebookButton />
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
