import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import type { ActivePage } from '../SignIn'

interface RegisterPageProps {
  setActivePage: (activePage: ActivePage) => void
  userEmail: string
}
export function RegisterPage({
  setActivePage,
  userEmail
}: RegisterPageProps): ReactElement {
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
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required(t('Enter your account name')),
    password: string()
      .required(t('Enter your password'))
      .min(6, 'Password must be at least 6 characters long')
  })
  async function createAccountAndSignIn(
    email: string,
    password: string
  ): Promise<void> {
    const auth = getAuth()
    await createUserWithEmailAndPassword(auth, email, password)
    await signInWithEmailAndPassword(auth, email, password)
  }
  async function handleCreateAccount(values, { setFieldError }): Promise<void> {
    try {
      await createAccountAndSignIn(values.email, values.password)
      await router.push({
        pathname: '/'
      })
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setFieldError(
          'email',
          'The email address is already used by another account'
        )
      } else {
        console.error(error)
      }
    }
  }
  return (
    <>
      <Formik
        initialValues={{ name: '', password: '', email: `${userEmail}` }}
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
                name="email"
                label="Email"
                placeholder={t('Enter your email address here')}
                variant="standard"
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
                name="name"
                label="Name"
                placeholder={t('First & last name')}
                variant="standard"
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
                name="password"
                label="Password"
                placeholder={t('Choose password')}
                variant="standard"
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
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around'
                }}
              >
                <Button
                  variant="text"
                  size="large"
                  fullWidth
                  onClick={() => setActivePage('home')}
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
                  {t('Save')}
                </Button>
              </Box>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  )
}
