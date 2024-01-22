import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import { PageProps } from '../types'

export function RegisterPage({
  setActivePage,
  userEmail
}: PageProps): ReactElement {
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
      .required(t('Required')),
    name: string()
      .trim()
      .min(2, t('Too Short!'))
      .max(50, t('Too Long!'))
      .required(t('Enter your account name')),
    password: string()
      .required(t('Enter your password'))
      .min(6, t('Password must be at least 6 characters long'))
  })
  async function createAccountAndSignIn(
    email: string,
    name: string,
    password: string
  ): Promise<void> {
    const auth = getAuth()
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    await updateProfile(userCredential.user, {
      displayName: name
    })
    await signInWithEmailAndPassword(auth, email, password)
  }
  async function handleCreateAccount(values, { setFieldError }): Promise<void> {
    try {
      await createAccountAndSignIn(values.email, values.name, values.password)
      await router.push({
        pathname: '/'
      })
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setFieldError(
          'email',
          t('The email address is already used by another account')
        )
      } else {
        console.error(error)
      }
    }
  }
  return (
    <>
      <Formik
        initialValues={{ name: '', password: '', email: userEmail }}
        validationSchema={validationSchema}
        onSubmit={handleCreateAccount}
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
          <Form noValidate autoComplete="off" data-testid="RegisterForm">
            <Stack gap={4} data-testid="RegisterPage">
              <Typography
                variant="h6"
                textAlign="left"
                sx={{ fontWeight: 'bold' }}
              >
                {t('Create account')}
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
                  touched?.email != null &&
                  errors.email != null && <>{errors.email}</>
                }
                fullWidth
              />
              <TextField
                autoComplete="on"
                name="name"
                label="Name"
                placeholder={t('First & last name')}
                variant="filled"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name != null && touched.name != null}
                helperText={
                  touched?.name != null &&
                  errors.name != null && <>{errors.name}</>
                }
                fullWidth
              />
              <TextField
                autoComplete="on"
                name="password"
                label="Password"
                placeholder={t('Choose password')}
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
                  disabled={!isValid || isSubmitting}
                >
                  {t('Sign Up')}
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  )
}
