import type { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { AgentConsent } from '../../src/components/AgentConsent'
import { PageWrapper } from '../../src/components/PageWrapper'
import {
  getAuthTokens,
  redirectToLogin,
  toUser,
  useAuth
} from '../../src/libs/auth'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

interface ConnectAgentPageProps {
  issuer: string
  interaction: string
}

export default function ConnectAgentPage({
  issuer,
  interaction
}: ConnectAgentPageProps): ReactElement {
  const { user } = useAuth()
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <PageWrapper title={t('Connect an agent')} user={user}>
      <AgentConsent issuer={issuer} interaction={interaction} />
    </PageWrapper>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  ctx.res.setHeader('Cache-Control', 'private, no-store')
  ctx.res.setHeader('Referrer-Policy', 'no-referrer')
  const issuer = process.env.AUTH_ISSUER
  if (
    !issuer ||
    typeof ctx.query.interaction !== 'string' ||
    !/^[A-Za-z0-9_-]{1,128}$/.test(ctx.query.interaction)
  )
    return { notFound: true }
  const tokens = await getAuthTokens(ctx)
  if (!tokens) return redirectToLogin(ctx)
  const user = toUser(tokens)
  const { redirect, translations, apolloClient, flags } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })
  if (redirect) return { redirect }
  return {
    props: {
      ...translations,
      issuer: new URL(issuer).origin,
      interaction: ctx.query.interaction,
      flags,
      userSerialized: JSON.stringify(user),
      initialApolloState: apolloClient.cache.extract()
    }
  }
}
