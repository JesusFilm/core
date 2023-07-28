import { ReactElement } from 'react'
import { ApolloError, gql } from '@apollo/client'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { useTranslation } from 'react-i18next'
import { JourneyInvite } from '../../src/components/JourneyInvite/JourneyInvite'
import { GetJourney } from '../../__generated__/GetJourney'
import { JourneyView } from '../../src/components/JourneyView'
import { PageWrapper } from '../../src/components/PageWrapper'
import { Menu } from '../../src/components/JourneyView/Menu'
import { ACCEPT_ALL_INVITES } from '..'
import { UserJourneyOpen } from '../../__generated__/UserJourneyOpen'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect/useInvalidJourneyRedirect'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { AcceptAllInvites } from '../../__generated__/AcceptAllInvites'

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

interface JourneyIdPageProps {
  data?: GetJourney
  error: ApolloError
}

function JourneyIdPage({ data, error }: JourneyIdPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useAuthUser()

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
            value={{ journey: data?.journey ?? undefined, admin: true }}
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

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale, query }) => {
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

  const { data, error } = await apolloClient.query<GetJourney>({
    query: GET_JOURNEY,
    variables: {
      id: query?.journeyId
    }
  })

  return {
    props: {
      flags,
      data,
      error: error ?? null,
      ...translations
    }
  }
})

export default withAuthUser<JourneyIdPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyIdPage)
