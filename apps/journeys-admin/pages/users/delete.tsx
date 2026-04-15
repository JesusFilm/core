import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { GetMe, GetMeVariables } from '../../__generated__/GetMe'
import { PageWrapper } from '../../src/components/PageWrapper'
import { GET_ME } from '../../src/components/PageWrapper/NavigationDrawer/UserNavigation/UserNavigation'
import { UserDelete } from '../../src/components/UserDelete'
import { useAuth } from '../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

export default function UserDeletePage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  return (
    <>
      <NextSeo title={t('Delete User')} />
      <PageWrapper title={t('Delete User')} user={user ?? undefined}>
        <UserDelete />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)
  const user = toUser(tokens)

  const { apolloClient, redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  // Server-side superAdmin guard — the client-side component also checks this,
  // but we enforce it here to prevent unauthorised users from loading the page.
  const meResult = await apolloClient.query<GetMe, GetMeVariables>({
    query: GET_ME,
    fetchPolicy: 'network-only'
  })
  if (
    meResult.data?.me?.__typename !== 'AuthenticatedUser' ||
    meResult.data.me.superAdmin !== true
  ) {
    return { redirect: { permanent: false, destination: '/' } }
  }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      ...translations
    }
  }
}
