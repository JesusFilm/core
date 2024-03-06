import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Redirect } from 'next'
import { User } from 'next-firebase-auth'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { v4 as uuidv4 } from 'uuid'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

import { AcceptAllInvites } from '../../../__generated__/AcceptAllInvites'
import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../apolloClient'
import { checkConditionalRedirect } from '../checkConditionalRedirect'

interface InitAndAuthAppProps {
  user?: User
  locale: string | undefined
  resolvedUrl?: string
}

interface InitAndAuth {
  apolloClient: ApolloClient<NormalizedCacheObject>
  flags: {
    [key: string]: boolean | undefined
  }
  redirect: Redirect | undefined
  translations: SSRConfig
}

export const ACCEPT_ALL_INVITES = gql`
  mutation AcceptAllInvites {
    userTeamInviteAcceptAll {
      id
    }
    userInviteAcceptAll {
      id
    }
  }
`

export async function initAndAuthApp({
  user,
  locale,
  resolvedUrl
}: InitAndAuthAppProps): Promise<InitAndAuth> {
  const ldUser =
    user?.id != null
      ? {
          key: user.id,
          firstName: user.displayName ?? undefined,
          email: user.email ?? undefined
        }
      : {
          key: uuidv4(),
          anonymous: true
        }

  // run independent tasks (getting user's ID token, and server-side translations) concurrently
  const [translations, launchDarklyClient, token] = await Promise.all([
    serverSideTranslations(
      locale ?? 'en',
      ['apps-journeys-admin', 'libs-journeys-ui'],
      i18nConfig
    ),
    getLaunchDarklyClient(ldUser),
    user?.id != null ? user.getIdToken() : null
  ])

  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }

  const apolloClient = createApolloClient(token ?? undefined)

  if (token == null) {
    return { apolloClient, flags, redirect: undefined, translations }
  }

  const redirect =
    resolvedUrl != null
      ? await checkConditionalRedirect({
          apolloClient,
          resolvedUrl
        })
      : undefined

  if (!(redirect?.destination.startsWith('/users/verify') ?? false))
    await apolloClient.mutate<AcceptAllInvites>({
      mutation: ACCEPT_ALL_INVITES
    })

  return { apolloClient, flags, redirect, translations }
}
