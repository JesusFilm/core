import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Redirect } from 'next'
import { User } from 'next-firebase-auth'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../apolloClient'
import { checkConditionalRedirect } from '../checkConditionalRedirect'

interface InitAndAuthAppProps {
  user?: User
  locale: string | undefined
  resolvedUrl: string
}

interface InitAndAuth {
  apolloClient: ApolloClient<NormalizedCacheObject>
  redirect: Redirect | undefined
  translations: SSRConfig
}

export async function initAndAuthApp({
  user,
  locale,
  resolvedUrl
}: InitAndAuthAppProps): Promise<InitAndAuth> {
  // run independent tasks (getting user's ID token, and server-side translations) concurrently
  const [translations, token] = await Promise.all([
    serverSideTranslations(
      locale ?? 'en',
      ['apps-journeys-admin', 'libs-journeys-ui'],
      i18nConfig
    ),
    user?.id != null ? user.getIdToken() : null
  ])

  const apolloClient = createApolloClient(token != null ? token : '')
  const redirect =
    token != null
      ? await checkConditionalRedirect({
          apolloClient,
          resolvedUrl
        })
      : undefined

  return { apolloClient, redirect, translations }
}
