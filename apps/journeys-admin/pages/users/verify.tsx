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
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useState } from 'react'
import { number, object } from 'yup'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import { CreateVerificationRequest } from '../../__generated__/CreateVerificationRequest'
import { GetMe } from '../../__generated__/GetMe'
import { CREATE_VERIFICATION_REQUEST } from '../../src/components/EmailVerification/EmailVerification'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { GET_ME } from '../../src/components/PageWrapper/NavigationDrawer/UserNavigation'
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
  const user = useUser()
  const email = user.email ?? ''
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
    await user.signOut()
    await client.resetStore()
    setActiveTeam(null)
    await router.push('/users/sign-in')
  }

  return (
    <>
      <NextSeo title={t('Email Verification')} />
      <OnboardingPageWrapper
        title={t('Verify Your Email')}
        emailSubject={t('Validate NextStep Email')}
        user={user}
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
                    variant="contained"
                    disabled={disableResendButton}
                    color="secondary"
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
                        variant="contained"
                        color="secondary"
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

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, query, locale }) => {
  const { translations, apolloClient } = await initAndAuthApp({
    user,
    locale
  })

  // skip if already verified
  const apiUser = await apolloClient.query<GetMe>({
    query: GET_ME,
    variables: { input: { redirect: query.redirect ?? undefined } }
  })
  if (apiUser.data?.me?.emailVerified ?? false) {
    return {
      redirect: {
        permanent: false,
        destination: `/`
      }
    }
  }

  const email = query?.email ?? null
  const token = query?.token ?? null

  if (email != null && token != null) {
    const { data } = await apolloClient.mutate({
      mutation: VALIDATE_EMAIL,
      variables: { email, token }
    })
    if (data.error != null) {
      return {
        props: {
          email,
          token,
          initialError: data.error,
          ...translations,
          initialApolloState: apolloClient.cache.extract()
        }
      }
    }
    return {
      redirect: {
        permanent: false,
        destination: `/?redirect=${(query.redirect as string) ?? null}`
      }
    }
  }
  return {
    props: {
      email,
      token,
      ...translations,
      initialApolloState: apolloClient.cache.extract()
    }
  }
})

export default withUser<ValidateEmailProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ValidateEmail)
