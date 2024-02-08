import { ApolloError, gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikValues } from 'formik'
import { GraphQLError } from 'graphql'
import { useRouter } from 'next/router'
import {
  AuthAction,
  User,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { number, object, string } from 'yup'

import { GetMe } from '../../__generated__/GetMe'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { GET_ME } from '../../src/components/PageWrapper/NavigationDrawer/UserNavigation'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

interface ValidateEmailProps {
  email?: string
  token?: string
  initialError?: GraphQLError | null
  user: User
}

const VALIDATE_EMAIL = gql`
  mutation ValidateEmail($email: String!, $token: String!) {
    validateEmail(email: $email, token: $token) {
      email
      token
    }
  }
`

function ValidateEmail({
  email,
  token,
  initialError = null,
  user
}: ValidateEmailProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [error, setError] = useState<GraphQLError | ApolloError | null>(
    initialError
  )
  const [disableValidationButton, setDisableValidationButton] = useState(false)
  const [validateEmail] = useMutation(VALIDATE_EMAIL, {
    variables: { email, token },
    onError(error) {
      setError(error)
    }
  })

  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Required')),
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
  const handleResendValidationEmail = async (): Promise<void> => {}
  return (
    <OnboardingPageWrapper emailSubject={t('Validate NextStep Email')}>
      <List>
        <Typography variant="h4">{t('Validate NextStep Email')}</Typography>
        <Divider />
        <Formik
          initialValues={{ email, token }}
          onSubmit={handleReValidateEmail}
          validationSchema={validationSchema}
        >
          {({ values, handleChange, handleBlur, errors, touched }) => (
            <Form noValidate autoComplete="off" data-testid="EmailInviteForm">
              <TextField
                label={t('Email')}
                name="email"
                fullWidth
                variant="filled"
                value={values.email}
                autoComplete="off"
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email != null && touched.email != null}
                helperText={
                  touched?.email != null && errors.email != null
                    ? errors.email
                    : ' '
                }
              />
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
                helperText={
                  touched?.token != null && errors.token != null
                    ? errors.token
                    : ' '
                }
              />
              <Button
                disabled={disableValidationButton}
                type="submit"
                variant="contained"
                fullWidth
              >
                {t('Validate Email')}
              </Button>
            </Form>
          )}
        </Formik>
        <Typography variant="body2" color="error">
          {error?.message}
        </Typography>
        <Divider />
        <Button
          onClick={handleResendValidationEmail}
          variant="contained"
          fullWidth
        >
          {t('Resend Validation Email')}
        </Button>
      </List>
    </OnboardingPageWrapper>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, query, locale, resolvedUrl }) => {
  const { apolloClient, flags, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  // skip if already verified
  // const apiUser = await apolloClient.query<GetMe>({ query: GET_ME })
  // if (apiUser.data?.me?.emailVerified ?? false) {
  //   return {
  //     redirect: {
  //       permanent: false,
  //       destination: '/'
  //     }
  //   }
  // }

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
          flags,
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
      flags,
      initialApolloState: apolloClient.cache.extract()
    }
  }
})

export default withUser<ValidateEmailProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ValidateEmail)
