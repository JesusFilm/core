import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  signOut as firebaseSignOut,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { InferType, object, string } from 'yup'

import { getFirebaseAuth, login, loginWithCredential } from '../../../libs/auth'
import { getPendingGuestJourney } from '../../../libs/pendingGuestJourney'
import { PageProps } from '../types'

export function PasswordPage({
  userEmail,
  userPassword,
  setActivePage
}: PageProps): ReactElement {
  const auth = getFirebaseAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const handleClickShowPassword = (): void => setShowPassword((show) => !show)
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault()
  }
  const { t } = useTranslation('apps-journeys-admin')
  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Please enter your email address')),
    password: string().required(t('Enter your password'))
  })
  async function handleLogin(
    values: InferType<typeof validationSchema>,
    { setFieldError }
  ): Promise<void> {
    try {
      if (auth.currentUser?.isAnonymous === true) {
        await firebaseSignOut(auth)
      }

      const credential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      )

      const pending = getPendingGuestJourney()
      if (pending != null) {
        const idToken = await credential.user.getIdToken()
        await login(idToken)
        const existingRedirect = router.query.redirect as string | undefined
        const redirectUrl =
          existingRedirect ?? `/templates/${pending.journeyId}/customize`
        window.location.href = `/users/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
        return
      }

      await loginWithCredential(credential)
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setFieldError(
          'password',
          t("The email and password you entered don't match")
        )
      } else if (error.code === 'auth/too-many-requests') {
        setFieldError(
          'password',
          t(
            'You have entered an incorrect password too many times. Please try again in a few minutes.'
          )
        )
      } else {
        console.error('An error occurred:', error.message)
      }
    }
  }
  return (
    <>
      <Formik
        initialValues={{ email: userEmail, password: userPassword }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ values, handleChange, handleBlur, errors, touched }) => (
          <Form>
            <Stack gap={4} data-testid="PasswordPage">
              <Typography variant="h6" textAlign="left" sx={{ mb: 2 }}>
                {t('Sign in')}
              </Typography>
              <TextField
                id="username"
                type="email"
                autoComplete="username"
                name="email"
                label="Email"
                placeholder={t('Enter your email address here')}
                variant="filled"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email != null && touched.email != null}
                helperText={
                  touched?.email != null &&
                  errors.email != null && <>{errors.email}</>
                }
                fullWidth
              />
              <TextField
                autoComplete="current-password"
                name="password"
                label="Password"
                placeholder={t('Enter Password')}
                variant="filled"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password != null && touched.password != null}
                helperText={
                  touched?.password != null &&
                  errors.password != null && <>{errors.password}</>
                }
                fullWidth
                id="current-password"
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                onClick={() => setActivePage?.('help')}
                sx={{ alignSelf: 'flex-end', p: 1.5 }}
              >
                <Typography variant="caption">
                  {t('Forgot your password?')}
                </Typography>
              </Button>
              <Stack direction="row" spacing={2}>
                <Button
                  size="large"
                  fullWidth
                  onClick={() => setActivePage?.('home')}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  type="submit"
                  color="secondary"
                  fullWidth
                >
                  {t('Sign In')}
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  )
}
