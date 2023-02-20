import { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { GetJourneys } from '../__generated__/GetJourneys'
import { UserInviteAcceptAll } from '../__generated__/UserInviteAcceptAll'
import { JourneyList } from '../src/components/JourneyList'
import { PageWrapper } from '../src/components/PageWrapper'
import { createApolloClient } from '../src/libs/apolloClient'
import i18nConfig from '../next-i18next.config'
import JourneyListMenu from '../src/components/JourneyList/JourneyListMenu/JourneyListMenu'
import { useTermsRedirect } from '../src/libs/useTermsRedirect/useTermsRedirect'

export const GET_JOURNEYS = gql`
  query GetJourneys {
    journeys: adminJourneys {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
      status
      seoTitle
      seoDescription
      userJourneys {
        id
        role
        openedAt
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
    }
  }
`

export const ACCEPT_USER_INVITE = gql`
  mutation UserInviteAcceptAll {
    userInviteAcceptAll {
      id
      acceptedAt
    }
  }
`

function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useQuery<GetJourneys>(GET_JOURNEYS)
  const AuthUser = useAuthUser()
  const router = useRouter()
  const [listEvent, setListEvent] = useState('')

  const activeTab = router.query.tab ?? 'active'
  const pageTitle =
    activeTab === 'active'
      ? t('Active Journeys')
      : activeTab === 'archived'
      ? t('Archived Journeys')
      : t('Trashed Journeys')

  const handleClick = (event: string): void => {
    setListEvent(event)
    // remove event after component lifecycle
    setTimeout(() => {
      setListEvent('')
    }, 1000)
  }
  useTermsRedirect()

  return (
    <>
      <NextSeo title={t('Journeys')} />
      <PageWrapper
        title={pageTitle}
        authUser={AuthUser}
        menu={<JourneyListMenu router={router} onClick={handleClick} />}
      >
        <JourneyList
          journeys={data?.journeys}
          router={router}
          event={listEvent}
          authUser={AuthUser}
        />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  const ldUser = {
    key: AuthUser.id as string,
    firstName: AuthUser.displayName ?? undefined,
    email: AuthUser.email ?? undefined
  }
  const launchDarklyClient = await getLaunchDarklyClient(ldUser)
  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }

  const token = await AuthUser.getIdToken()
  const apolloClient = createApolloClient(token != null ? token : '')

  await apolloClient.mutate<UserInviteAcceptAll>({
    mutation: ACCEPT_USER_INVITE
  })

  return {
    props: {
      flags,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(IndexPage)
