import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { gql, useMutation } from '@apollo/client'
import { getApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  linkWithCredential,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useUser } from 'next-firebase-auth'
import React, { ReactElement, useState } from 'react'
import { InferType, object, string } from 'yup'

import { useCurrentUserLazyQuery } from '../../../libs/useCurrentUserLazyQuery'
import { useHandleNewAccountRedirect } from '../../../libs/useRedirectNewAccount'
import { PageProps } from '../types'

const MERGE_GUEST = gql`
  mutation MergeGuest($input: MergeGuestInput!) {
    mergeGuest(input: $input) {
      id
      userId
      email
      firstName
      lastName
      emailVerified
    }
  }
`

function parseNameToFirstAndLast(name: string): {
  firstName: string
  lastName: string
} {
  const trimmed = name.trim()
  if (trimmed === '') return { firstName: '', lastName: '' }
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  }
}

function getErrorMessage(err: unknown, prefix: string): string {
  if (err == null) return `${prefix}: Unknown error`
  const apolloErr = err as {
    message?: string
    graphQLErrors?: Array<{ message?: string }>
    networkError?: { message?: string; result?: { error?: string } }
  }
  const gqlMessage = apolloErr.graphQLErrors?.[0]?.message
  const networkMessage =
    apolloErr.networkError?.result?.error ?? apolloErr.networkError?.message
  const message =
    gqlMessage ?? networkMessage ?? apolloErr.message ?? String(err)
  return `${prefix}: ${message}`
}

export function RegisterPage({
  setActivePage,
  userEmail
}: PageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [showPassword, setShowPassword] = React.useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()
  const user = useUser()
  const [mergeGuest] = useMutation(MERGE_GUEST)
  const { loadUser } = useCurrentUserLazyQuery()

  const isAnonymous = user.firebaseUser?.isAnonymous ?? false

  useHandleNewAccountRedirect()

  const handleClickShowPassword = (): void => setShowPassword((show) => !show)

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault()
  }

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

  async function mergeGuestAndSignIn(
    email: string,
    name: string,
    password: string,
    setFieldError: (field: string, message: string) => void,
    setSubmitting: (isSubmitting: boolean) => void
  ): Promise<void> {
    const auth = getAuth(getApp())
    const firebaseUser = auth.currentUser
    if (firebaseUser == null) {
      setSubmitError(t('Not signed in. Please try again.'))
      setSubmitting(false)
      return
    }
    try {
      await updateProfile(firebaseUser, { displayName: name })
    } catch (err) {
      setSubmitError(getErrorMessage(err, t('Update profile')))
      setSubmitting(false)
      return
    }
    try {
      const credential = EmailAuthProvider.credential(email, password)
      await linkWithCredential(firebaseUser, credential)
    } catch (err) {
      const errCode = (err as { code?: string })?.code
      if (errCode === 'auth/email-already-in-use') {
        setFieldError(
          'email',
          t('The email address is already used by another account')
        )
      } else {
        setSubmitError(getErrorMessage(err, t('Link account')))
      }
      setSubmitting(false)
      return
    }
    const { firstName, lastName } = parseNameToFirstAndLast(name)
    try {
      await mergeGuest({
        variables: {
          input: { firstName, lastName, email }
        }
      })
    } catch (err) {
      setSubmitError(getErrorMessage(err, t('Save account')))
      setSubmitting(false)
      return
    }
    try {
      await loadUser()
    } catch (err) {
      setSubmitError(getErrorMessage(err, t('Reload user')))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreateAccount(
    values: InferType<typeof validationSchema>,
    { setFieldError, setSubmitting }
  ): Promise<void> {
    setSubmitError(null)
    try {
      if (isAnonymous) {
        await mergeGuestAndSignIn(
          values.email,
          values.name,
          values.password,
          setFieldError,
          setSubmitting
        )
      } else {
        await createAccountAndSignIn(values.email, values.name, values.password)
      }
    } catch (error) {
      const errCode = (error as { code?: string })?.code
      if (errCode === 'auth/email-already-in-use') {
        setFieldError(
          'email',
          t('The email address is already used by another account')
        )
      } else {
        setSubmitError(
          error instanceof Error ? error.message : t('Something went wrong')
        )
        console.error(error)
      }
      setSubmitting(false)
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
          <Form data-testid="RegisterForm">
            <Stack gap={4} data-testid="RegisterPage">
              <Typography variant="h6" textAlign="left" sx={{ mb: 2 }}>
                {t('Create account')}
              </Typography>
              {submitError != null && (
                <Typography variant="body2" color="error">
                  {submitError}
                </Typography>
              )}
              <TextField
                id="name"
                autoComplete="name"
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
                id="new-password"
                autoComplete="new-password"
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
                  onClick={() => {
                    setActivePage?.('home')
                    router.back()
                  }}
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
