import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Redirect } from 'next'
import { AuthUser } from 'next-firebase-auth'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { v4 as uuidv4 } from 'uuid'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../apolloClient'
import { checkConditionalRedirect } from '../checkConditionalRedirect'

interface props {
  AuthUser?: AuthUser
  locale: string | undefined
  refererUrl?: string
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
  locale,
  refererUrl
}: props): Promise<initAndAuth> {
  const ldUser =
    AuthUser?.id != null
      ? {
          key: AuthUser.id,
          firstName: AuthUser.displayName ?? undefined,
          email: AuthUser.email ?? undefined
        }
      : {
          key: uuidv4(),
          anonymous: true
        }

  // run independent tasks (getting LaunchDarkly client, user's ID token, and server-side translations) concurrently
  const [translations, launchDarklyClient, token] = await Promise.all([
    serverSideTranslations(
      locale ?? 'en',
      ['apps-journeys-admin', 'libs-journeys-ui'],
      i18nConfig
    ),
    getLaunchDarklyClient(ldUser),
    AuthUser?.id != null ? AuthUser.getIdToken() : null
  ])

  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }

  const apolloClient = createApolloClient(token != null ? token : '')
  const redirect =
    token != null
      ? await checkConditionalRedirect(apolloClient, flags, refererUrl)
      : undefined

  return { apolloClient, flags, redirect, translations }
}
