import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement, useEffect, useState } from 'react'

import { PageWrapper } from '../../../src/components/PageWrapper'

import i18nConfig from '../../../next-i18next.config'
import {
  ValidateEmail,
  ValidateEmailVariables
} from '../../../__generated__/ValidateEmail'

const VALIDATE_EMAIL = gql`
  mutation ValidateEmail($email: String!, $token: String!) {
    validateEmail(email: $email, token: $token) {
      id
      emailVerified
    }
  }
`

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error' | 'missing_params'

function PageVerify(): ReactElement {
  const { t } = useTranslation('apps-resources')
  const router = useRouter()
  const [status, setStatus] = useState<VerifyStatus>('idle')
  const [validateEmailMutation, { loading, data }] = useMutation<
    ValidateEmail,
    ValidateEmailVariables
  >(VALIDATE_EMAIL, {
    onCompleted: () => {
      setStatus('success')
    },
    onError: () => {
      setStatus('error')
    }
  })

  useEffect(() => {
    const email =
      typeof router.query.email === 'string' ? router.query.email : null
    const token =
      typeof router.query.token === 'string' ? router.query.token : null
    if (email == null || token == null) {
      setStatus('missing_params')
      return
    }
    setStatus('loading')
    void validateEmailMutation({
      variables: {
        email,
        token
      }
    })
  }, [])

  const renderContent = (): ReactElement => {
    if (status === 'missing_params') {
      return (
        <>
          <Typography component="h1" variant="h4">
            {t('Invalid verification link')}
          </Typography>
          <Typography color="text.secondary" variant="body1">
            {t(
              'This link is missing the required parameters. Please use the link from your verification email.'
            )}
          </Typography>
        </>
      )
    }
    if (status === 'loading') {
      return (
        <Typography component="h1" variant="h4">
          {t('Verifying your email…')}
        </Typography>
      )
    }
    if (status === 'error') {
      return (
        <>
          <Typography component="h1" variant="h4">
            {t('Verification failed')}
          </Typography>
          <Typography color="error" variant="body1">
            {t('Token expired')}
          </Typography>
        </>
      )
    }
    return (
      <>
        <Typography component="h1" variant="h4">
          {t('Email verified')}
        </Typography>
        <Typography color="text.secondary" variant="body1">
          {t('Your email has been successfully verified.')}
        </Typography>
      </>
    )
  }

  return (
    <PageWrapper>
      <Box sx={{ backgroundColor: 'background.default', minHeight: '60vh' }}>
        <Container maxWidth="sm">
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={3}
            sx={{ py: 8 }}
          >
            {renderContent()}
          </Stack>
        </Container>
      </Box>
    </PageWrapper>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-resources'],
        i18nConfig
      ))
    }
  }
}

export default PageVerify
