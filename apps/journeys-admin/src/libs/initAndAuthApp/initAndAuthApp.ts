import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { Redirect } from 'next'
import { User } from 'next-firebase-auth'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { v4 as uuidv4 } from 'uuid'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

import { AcceptAllInvites } from '../../../__generated__/AcceptAllInvites'
// import { GetMe } from '../../../__generated__/GetMe'
import i18nConfig from '../../../next-i18next.config'
// import { GET_ME } from '../../components/PageWrapper/NavigationDrawer/UserNavigation/UserNavigation'
import { createApolloClient } from '../apolloClient'
import { checkConditionalRedirect } from '../checkConditionalRedirect'

async function initializeAnonymousUser(): Promise<InitAndAuth> {
  // const userCredential = await signInAnonymously(getAuth(firebaseClient))
  // const newUser = userCredential.user
  // const token = await newUser.getIdToken()

  // Create a temporary user object for LaunchDarkly
  const ldUser = {
    key: uuidv4(),
    anonymous: true
  }

  // Get translations and LaunchDarkly client
  const [translations, launchDarklyClient] = await Promise.all([
    serverSideTranslations(
      'en',
      ['apps-journeys-admin', 'libs-journeys-ui'],
      i18nConfig
    ),
    getLaunchDarklyClient(ldUser)
  ])

  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }

  const apolloClient = createApolloClient()

  // create a db user for the guest - needed for guest team creation
  // await apolloClient.query<GetMe>({
  //   query: GET_ME,
  //   variables: { input: { redirect: '' } }
  // })

  return {
    apolloClient,
    flags,
    redirect: undefined,
    translations
  }
}

interface InitAndAuthAppProps {
  user?: User
  locale: string | undefined
  resolvedUrl?: string
  allowAnonymous?: boolean
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
  resolvedUrl,
  allowAnonymous = false
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
  const i18nStore = translations._nextI18Next?.initialI18nStore as
    | {
        [key: string]: { 'apps-journeys-admin': { [key: string]: string } }
      }
    | null
    | undefined
  let teamName = 'My Team'

  // t("{{ name }}'s Team") leave this comment for extract-translation runner
  if (i18nStore != null && user != null && user.displayName != null) {
    teamName =
      Object.values(i18nStore)[0]['apps-journeys-admin'][
        "{{ name }}'s Team"
      ]?.replace('{{ name }}', user.displayName) ?? teamName
  }

  const redirect =
    resolvedUrl != null && allowAnonymous === false
      ? await checkConditionalRedirect({
          apolloClient,
          resolvedUrl,
          teamName
        })
      : undefined

  if (
    !(redirect?.destination.startsWith('/users/verify') ?? false) &&
    user?.email != null
  )
    await apolloClient.mutate<AcceptAllInvites>({
      mutation: ACCEPT_ALL_INVITES
    })

  return { apolloClient, flags, redirect, translations }
}
