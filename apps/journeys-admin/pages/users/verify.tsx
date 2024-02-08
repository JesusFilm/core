import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { GraphQLError } from 'graphql'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { number, object, string } from 'yup'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'

import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

interface ValidateEmailProps {
  email?: string
  token?: string
  error?: GraphQLError
}

const VALIDATE_EMAIL = gql`
  mutation ValidateEmail($email: String!, $token: String!) {
    validateEmail(email: $email, token: $token) {
      email
      token
    }
  }
`

function ValidateEmail({ email, token }: ValidateEmailProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [validateEmail, { error }] = useMutation(VALIDATE_EMAIL, {
    variables: { email, token }
  })

  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Required')),
    token: number().min(100000).max(999999).required(t('Required'))
  })

  const handleReValidateEmail = async (): Promise<void> => {}
  const handleResendValidationEmail = async (): Promise<void> => {}
  return (
    <>
      <h1>{t('Validate Email')}</h1>
      <Formik
        initialValues={{ email }}
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
                  : t('No email notifications. New users get access instantly.')
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="submit"
                      aria-label="add user"
                      color="primary"
                      disabled={values.email === ''}
                    >
                      <AddSquare4Icon
                        sx={{
                          color:
                            values.email !== '' && errors.email == null
                              ? 'primary.main'
                              : 'secondary.light'
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <p>
              : {email}
              <br />
              {t('Token')}: {token}
            </p>
          </Form>
        )}
      </Formik>
    </>
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
  const { email, token } = query
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
          error: data.error,
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
