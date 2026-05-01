import { ApolloError, gql, useApolloClient, useMutation } from '@apollo/client'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikValues } from 'formik'
import { GraphQLError } from 'graphql'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { ReactElement, useState } from 'react'
import { number, object } from 'yup'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import { CreateVerificationRequest } from '../../__generated__/CreateVerificationRequest'
import { GetMe } from '../../__generated__/GetMe'
import {
  ValidateEmail as ValidateEmailType,
  ValidateEmailVariables
} from '../../__generated__/ValidateEmail'
import { CREATE_VERIFICATION_REQUEST } from '../../src/components/EmailVerification/EmailVerification'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { GET_ME } from '../../src/components/PageWrapper/NavigationDrawer/UserNavigation'
import { useAuth } from '../../src/libs/auth'
import { logout } from '../../src/libs/auth/firebase'
import {
  getAuthTokens,
  redirectToApp,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useHandleNewAccountRedirect } from '../../src/libs/useRedirectNewAccount'

interface ValidateEmailProps {
  email?: string
  token?: string
  initialError?: GraphQLError | null
}

const VALIDATE_EMAIL = gql`
  mutation ValidateEmail($email: String!, $token: String!) {
    validateEmail(email: $email, token: $token) {
      id
      emailVerified
    }
  }
`

function ValidateEmail({
  token,
  initialError = null
}: ValidateEmailProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const client = useApolloClient()
  const { user } = useAuth()
  const email = user?.email ?? ''
  const { setActiveTeam } = useTeam()
  const [error, setError] = useState<GraphQLError | ApolloError | null>(
    initialError
  )
  const [disableValidationButton, setDisableValidationButton] = useState(false)
  const [disableResendButton, setDisableResendButton] = useState(false)
  const [validateEmail] = useMutation(VALIDATE_EMAIL, {
    variables: { email, token },
    onError(error) {
      setError(error)
    }
  })

  const [resendValidationEmail] = useMutation<CreateVerificationRequest>(
    CREATE_VERIFICATION_REQUEST,
    {
      variables: { input: { redirect: router?.query?.redirect } }
    }
  )

  useHandleNewAccountRedirect()

  const validationSchema = object().shape({
    token: number().min(100000).max(999999).required(t('Required'))
  })

  const handleReValidateEmail = async (values: FormikValues): Promise<void> => {
    setDisableValidationButton(true)
    await validateEmail({
      variables: { email, token: values.token },
      onCompleted: async () => {
        await router.push({
          pathname: '/users/terms-and-conditions',
          query: { redirect: router.query.redirect }
        })
      }
    })
    setTimeout(() => {
      setDisableValidationButton(false)
    }, 10000)
  }

  const handleResendValidationEmail = async (): Promise<void> => {
    await resendValidationEmail()
    setDisableResendButton(true)
    setTimeout(() => {
      setDisableResendButton(false)
    }, 30000)
  }

  const handleLogout = async (): Promise<void> => {
    await client.resetStore()
    setActiveTeam(null)
    await logout()
  }

  return (
    <>
      <NextSeo title={t('Email Verification')} />
      <OnboardingPageWrapper
        title={t('Verify Your Email')}
        emailSubject={t('Validate NextStep Email')}
        user={user ?? undefined}
      >
        <Formik
          initialValues={{ token }}
          onSubmit={handleReValidateEmail}
          validationSchema={validationSchema}
        >
          {({ values, handleChange, handleBlur, errors, touched }) => (
            <Form noValidate autoComplete="off" data-testid="EmailInviteForm">
              <Stack textAlign="center">
                <Stack textAlign="left" spacing={4}>
                  <Typography variant="subtitle2">{email}</Typography>
                  <Typography variant="body1">
                    {t(
                      'Email has been sent to this address with a link to verify your account. If you have not received the email after a few minutes, please check your spam folder.'
                    )}
                  </Typography>
                  <Button
                    onClick={handleResendValidationEmail}
                    variant="blockContained"
                    disabled={disableResendButton}
                    color="solid"
                    size="small"
                    fullWidth
                  >
                    {t('Resend Validation Email')}
                  </Button>
                </Stack>
                <Accordion
                  sx={{
                    mt: 7,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    border: '1px solid',
                    borderRadius: '8px !important',
                    borderColor: 'divider',
                    '&:before': { opacity: 0 }
                  }}
                  elevation={0}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    data-testid="VerifyCodeAccordionSummary"
                  >
                    <Typography px={4}>
                      {t('Verify With Code Instead')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ textAlign: 'left' }}>
                    <Stack spacing={4} px={4}>
                      <Typography variant="body1">
                        {t('Enter verification code from email')}
                      </Typography>
                      <TextField
                        label={t('Code')}
                        name="token"
                        fullWidth
                        variant="filled"
                        value={values.token}
                        autoComplete="off"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.token != null && touched.token != null}
                        helperText={
                          <>
                            {touched?.token != null && errors.token != null
                              ? errors.token
                              : ' '}
                          </>
                        }
                      />
                      <Button
                        disabled={disableValidationButton}
                        type="submit"
                        variant="blockContained"
                        color="solid"
                        size="small"
                        sx={{ mb: 4 }}
                        fullWidth
                      >
                        {t('Validate Email')}
                      </Button>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                <Typography variant="body2" color="error">
                  {error?.message ?? ' '}
                </Typography>
                <Button
                  onClick={handleLogout}
                  sx={{ mt: 7 }}
                  variant="text"
                  fullWidth
                >
                  {t('Logout')}
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)

  const user = toUser(tokens)
  // resolvedUrl is intentionally omitted so that checkConditionalRedirect
  // (called inside initAndAuthApp) does not run — otherwise the verify page
  // would redirect to itself in a loop.
  const { translations, apolloClient } = await initAndAuthApp({
    user,
    locale: ctx.locale
  })

  const rawEmail = typeof ctx.query?.email === 'string' ? ctx.query.email : null
  const email = rawEmail != null ? rawEmail.replace(/\s/g, '+') : null
  const token = typeof ctx.query?.token === 'string' ? ctx.query.token : null

  // Validate email+token from query params first, before checking cookie user.
  // This prevents stale cookies from a previous session (e.g. Google login)
  // short-circuiting the verification for the current guest user.
  if (email != null && token != null) {
    const redirectQuery =
      typeof ctx.query.redirect === 'string'
        ? `?redirect=${encodeURIComponent(ctx.query.redirect)}`
        : ''

    try {
      await apolloClient.mutate<ValidateEmailType, ValidateEmailVariables>({
        mutation: VALIDATE_EMAIL,
        variables: { email, token }
      })
      // Redirect to terms-and-conditions — the next onboarding step — same
      // as the client-side manual-code path (handleReValidateEmail). This
      // ensures a journey profile is created even when server-side cookies
      // belong to a different user than the client-side Firebase auth.
      return {
        redirect: {
          destination: `/users/terms-and-conditions${redirectQuery}`,
          permanent: false
        }
      }
    } catch {
      return {
        props: {
          email,
          token,
          initialError: null,
          userSerialized: JSON.stringify(user),
          ...translations,
          initialApolloState: apolloClient.cache.extract()
        }
      }
    }
  }

  // skip if already verified (only reached when no email+token query params)
  const apiUser = await apolloClient.query<GetMe>({
    query: GET_ME,
    variables: { input: { redirect: ctx.query.redirect ?? undefined } }
  })
  if (
    apiUser.data?.me?.__typename === 'AuthenticatedUser' &&
    (apiUser.data?.me?.emailVerified ?? false)
  ) {
    return redirectToApp(ctx)
  }
  return {
    props: {
      email,
      token,
      userSerialized: JSON.stringify(user),
      ...translations,
      initialApolloState: apolloClient.cache.extract()
    }
  }
}

export default ValidateEmail
