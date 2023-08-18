import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { decode } from 'jsonwebtoken'
import { Redirect } from 'next'
import { AuthUser } from 'next-firebase-auth'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../apolloClient'
import { checkConditionalRedirect } from '../checkConditionalRedirect'

interface props {
  AuthUser: AuthUser
  locale: string | undefined
}

interface initAndAuth {
  apolloClient: ApolloClient<NormalizedCacheObject>
  flags: {
    [key: string]: boolean | undefined
  }
  redirect: Redirect | undefined
  translations: SSRConfig
}

export async function initAndAuthApp({
  AuthUser,
  locale
}: props): Promise<initAndAuth> {
  const ldUser = {
    key: AuthUser.id as string,
    firstName: AuthUser.displayName ?? undefined,
    email: AuthUser.email ?? undefined
  }

  // run independent tasks (getting LaunchDarkly client, user's ID token, and server-side translations) concurrently
  const [translations, launchDarklyClient, token] = await Promise.all([
    serverSideTranslations(
      locale ?? 'en',
      ['apps-journeys-admin', 'libs-journeys-ui'],
      i18nConfig
    ),
    getLaunchDarklyClient(ldUser),
    AuthUser.getIdToken(true)
  ])

  const decodedToken = decode(token ?? '') as { exp: number }
  const tokenExpiresAt = decodedToken.exp
  const now = Math.floor(Date.now() / 1000)
  console.log('expired?', now > tokenExpiresAt)

  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }

  const apolloClient = createApolloClient(token != null ? token : '')
  const redirect = await checkConditionalRedirect(apolloClient, flags)

  return { apolloClient, flags, redirect, translations }
}
