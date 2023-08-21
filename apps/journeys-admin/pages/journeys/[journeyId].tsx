import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

import { ACCEPT_ALL_INVITES } from '..'
import { AcceptAllInvites } from '../../__generated__/AcceptAllInvites'
import { GetJourney } from '../../__generated__/GetJourney'
import { UserJourneyOpen } from '../../__generated__/UserJourneyOpen'
import { JourneyInvite } from '../../src/components/JourneyInvite/JourneyInvite'
import { JourneyView } from '../../src/components/JourneyView'
import { Menu } from '../../src/components/JourneyView/Menu'
import { PageWrapper } from '../../src/components/PageWrapper'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect/useInvalidJourneyRedirect'

export const GET_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

export const USER_JOURNEY_OPEN = gql`
  mutation UserJourneyOpen($id: ID!) {
    userJourneyOpen(id: $id) {
      id
    }
  }
`

function JourneyIdPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useUser()
  const { data, error } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeyId }
  })

  useInvalidJourneyRedirect(data)

  return (
    <>
      {error == null && (
        <>
          <NextSeo
            title={data?.journey?.title ?? t('Journey')}
            description={data?.journey?.description ?? undefined}
          />
          <JourneyProvider
            value={{
              journey: data?.journey ?? undefined,
              variant: 'admin'
            }}
          >
            <PageWrapper
              title={t('Journey Details')}
              showDrawer
              backHref="/"
              menu={<Menu />}
              authUser={AuthUser}
            >
              <JourneyView journeyType="Journey" />
            </PageWrapper>
          </JourneyProvider>
        </>
      )}
      {error?.graphQLErrors[0].message ===
        'user is not allowed to view journey' && (
        <>
          <NextSeo title={t('Access Denied')} />
          <JourneyInvite journeyId={router.query.journeyId as string} />
        </>
      )}
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user: AuthUser, locale, query }) => {
  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
    locale
  })

  if (redirect != null) return { redirect }

  await Promise.all([
    apolloClient.mutate<AcceptAllInvites>({
      mutation: ACCEPT_ALL_INVITES
    }),
    apolloClient.mutate<UserJourneyOpen>({
      mutation: USER_JOURNEY_OPEN,
      variables: { id: query?.journeyId }
    })
  ])

  return {
    props: {
      flags,
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyIdPage)
