import type { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { ConnectedAgents } from '../../src/components/ConnectedAgents'
import { PageWrapper } from '../../src/components/PageWrapper'
import {
  getAuthTokens,
  redirectToLogin,
  toUser,
  useAuth
} from '../../src/libs/auth'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

export default function ConnectedAgentsPage({
  issuer
}: {
  issuer: string
}): ReactElement {
  const { user } = useAuth()
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <PageWrapper title={t('Connected agents')} user={user}>
      <ConnectedAgents issuer={issuer} />
    </PageWrapper>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  ctx.res.setHeader('Cache-Control', 'private, no-store')
  ctx.res.setHeader('Referrer-Policy', 'no-referrer')
  const issuer = process.env.AUTH_ISSUER
  if (!issuer) return { notFound: true }
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
      flags,
      userSerialized: JSON.stringify(user),
      initialApolloState: apolloClient.cache.extract()
    }
  }
}
