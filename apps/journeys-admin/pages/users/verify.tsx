import { ApolloError, gql, useApolloClient, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { number, object } from 'yup'

import { CreateVerificationRequest } from '../../__generated__/CreateVerificationRequest'
import { GetMe } from '../../__generated__/GetMe'
import i18nConfig from '../../next-i18next.config'
import { CREATE_VERIFICATION_REQUEST } from '../../src/components/EmailVerification/EmailVerification'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { GET_ME } from '../../src/components/PageWrapper/NavigationDrawer/UserNavigation'
import { useTeam } from '../../src/components/Team/TeamProvider'
import { createApolloClient } from '../../src/libs/apolloClient'

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
    CREATE_VERIFICATION_REQUEST
  )

  const validationSchema = object().shape({
    token: number().min(100000).max(999999).required(t('Required'))
  })

  const handleReValidateEmail = async (values: FormikValues): Promise<void> => {
    await validateEmail({
      variables: { email: values.email, token: values.token },
      onCompleted: async () => {
        await router.push('/')
      }
    })
    setDisableValidationButton(true)
    setTimeout(() => {
      setDisableValidationButton(false)
    }, 30000)
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
    await user.signOut()
    setActiveTeam(null)
    await router.push('/users/sign-in')
  }

  return (
    <OnboardingPageWrapper emailSubject={t('Validate NextStep Email')}>
      <Formik
        initialValues={{ email, token }}
        onSubmit={handleReValidateEmail}
        validationSchema={validationSchema}
      >
        {({ values, handleChange, handleBlur, errors, touched }) => (
          <Form noValidate autoComplete="off" data-testid="EmailInviteForm">
            <List>
              <ListItem>
                <Typography variant="h4">
                  {t('Validate NextStep Email')}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body2">
                  {t(
                    'Please check your email for the six-digit token that was sent to your email address.'
                  )}
                </Typography>
              </ListItem>
              <ListItem>
                <Divider />
              </ListItem>
              <ListItem>
                <TextField
                  label={t('Email')}
                  name="email"
                  fullWidth
                  variant="filled"
                  value={values.email}
                  autoComplete="off"
                  disabled
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email != null && touched.email != null}
                  helperText=<>
                    {touched?.email != null && errors.email != null
                      ? errors.email
                      : ' '}
                  </>
                />
              </ListItem>
              <ListItem>
                <TextField
                  label={t('Token')}
                  name="token"
                  fullWidth
                  variant="filled"
                  value={values.token}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.token != null && touched.token != null}
                  helperText=<>
                    {touched?.token != null && errors.token != null
                      ? errors.token
                      : ' '}
                  </>
                />
              </ListItem>
              <ListItem>
                <Button
                  disabled={disableValidationButton}
                  type="submit"
                  variant="contained"
                  fullWidth
                >
                  {t('Validate Email')}
                </Button>
              </ListItem>
              <ListItem>
                <Typography variant="body2" color="error">
                  {error?.message ?? ' '}
                </Typography>
              </ListItem>
              <ListItem>
                <Divider />
              </ListItem>
              <ListItem>
                <Button
                  onClick={handleResendValidationEmail}
                  variant="contained"
                  disabled={disableResendButton}
                  fullWidth
                >
                  {t('Resend Validation Email')}
                </Button>
              </ListItem>
              <ListItem>
                <Button onClick={handleLogout} variant="contained" fullWidth>
                  {t('Logout')}
                </Button>
              </ListItem>
            </List>
          </Form>
        )}
      </Formik>
    </OnboardingPageWrapper>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, query, locale }) => {
  const apolloToken = user?.id != null ? await user.getIdToken() : null
  const apolloClient = createApolloClient(apolloToken ?? undefined)
  const translations = await serverSideTranslations(
    locale ?? 'en',
    ['apps-journeys-admin', 'libs-journeys-ui'],
    i18nConfig
  )

  // skip if already verified
  const apiUser = await apolloClient.query<GetMe>({ query: GET_ME })
  if (apiUser.data?.me?.emailVerified ?? false) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
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
        destination: '/'
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
