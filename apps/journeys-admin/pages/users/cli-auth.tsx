import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect, useState } from 'react'

import i18nConfig from '../../next-i18next.config'
import { getFirebaseAuth } from '../../src/libs/auth/firebase'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'

interface CliAuthPageProps {
  callback: string
  state: string
  environment: string | null
  initialToken: string
  initialUser: { id: string; email: string | null }
}

type Status = 'sending' | 'success' | 'error'

const ALLOWED_CALLBACK_HOSTNAMES = new Set(['127.0.0.1', 'localhost'])
const STATE_PATTERN = /^[a-f0-9]{16,64}$/i

function isAllowedCallback(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:') return false
    if (!ALLOWED_CALLBACK_HOSTNAMES.has(url.hostname)) return false
    if (url.port.length === 0) return false
    return true
  } catch {
    return false
  }
}

export default function CliAuthPage({
  callback,
  state,
  environment,
  initialToken,
  initialUser
}: CliAuthPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [status, setStatus] = useState<Status>('sending')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function deliver(): Promise<void> {
      try {
        const auth = getFirebaseAuth()
        const fresh = await auth.currentUser?.getIdToken(true)
        const token = fresh ?? initialToken

        const response = await fetch(callback, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            state,
            email: initialUser.email,
            userId: initialUser.id
          })
        })

        if (cancelled) return

        if (!response.ok) {
          setErrorMessage(`Callback returned HTTP ${response.status}.`)
          setStatus('error')
          return
        }
        setStatus('success')
      } catch (error) {
        if (cancelled) return
        setErrorMessage(
          error instanceof Error ? error.message : 'Unknown error'
        )
        setStatus('error')
      }
    }
    void deliver()
    return () => {
      cancelled = true
    }
  }, [callback, state, initialToken, initialUser])

  return (
    <>
      <NextSeo title={t('Sign in to scribe')} />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Stack
          spacing={2}
          sx={{
            maxWidth: 480,
            p: 4,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h6">{t('Sign in to scribe')}</Typography>
          {environment != null ? (
            <Typography variant="body2" color="text.secondary">
              {t('Environment: {{environment}}', { environment })}
            </Typography>
          ) : null}
          {status === 'sending' ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2">
                {t('Delivering credential to the CLI...')}
              </Typography>
            </Stack>
          ) : null}
          {status === 'success' ? (
            <Typography variant="body1">
              {t(
                'Signed in. You can close this tab and return to the terminal.'
              )}
            </Typography>
          ) : null}
          {status === 'error' ? (
            <Stack spacing={1}>
              <Typography variant="body1" color="error">
                {t('Could not deliver the credential to the CLI.')}
              </Typography>
              {errorMessage != null ? (
                <Typography variant="body2" color="text.secondary">
                  {errorMessage}
                </Typography>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                {t(
                  'Make sure scribe is still running, then re-run the login command.'
                )}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Box>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const callback = typeof ctx.query.callback === 'string' ? ctx.query.callback : ''
  const state = typeof ctx.query.state === 'string' ? ctx.query.state : ''
  const environment =
    typeof ctx.query.environment === 'string' ? ctx.query.environment : null

  if (!isAllowedCallback(callback) || !STATE_PATTERN.test(state)) {
    return { notFound: true }
  }

  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)

  const user = toUser(tokens)

  return {
    props: {
      callback,
      state,
      environment,
      initialToken: tokens.token,
      initialUser: { id: user.id, email: user.email },
      ...(await serverSideTranslations(
        ctx.locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
}
