import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import { PageProps } from '../types'

export function PasswordPage({
  userEmail,
  setActivePage
}: PageProps): ReactElement {
  const auth = getAuth()
  const [showPassword, setShowPassword] = React.useState(false)
  const handleClickShowPassword = (): void => setShowPassword((show) => !show)
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault()
  }
  const { t } = useTranslation()
  const router = useRouter()
  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Please enter your email address')),
    password: string().required(t('Enter your password'))
  })
  async function handleLogin(values, { setFieldError }): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password)

      await router.push({
        pathname: '/'
      })
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
        initialValues={{ email: userEmail, password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ values, handleChange, handleBlur, errors, touched }) => (
          <Form autoComplete="off" data-testid="">
            <Stack gap={4} data-testid="PasswordPage">
              <Typography variant="h6" textAlign="left">
                {t('Sign in')}
              </Typography>
              <TextField
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
                id="standard-adornment-password"
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
              <Typography variant="caption" textAlign="right">
                <Link
                  onClick={() => setActivePage?.('help')}
                  sx={{ textDecoration: 'none' }}
                >
                  {t('Forgot your password?')}
                </Link>
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="text"
                  size="large"
                  fullWidth
                  onClick={() => setActivePage?.('home')}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  type="submit"
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
