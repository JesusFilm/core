import {
  useAuthUser,
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NextSeo } from 'next-seo'
import { gql, useQuery } from '@apollo/client'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { PageWrapper } from '../../../../src/components/NewPageWrapper'
import { useTermsRedirect } from '../../../../src/libs/useTermsRedirect'
import { GetJourney } from '../../../../__generated__/GetJourney'
import { GET_JOURNEY, USER_JOURNEY_OPEN } from '../../[journeyId]'
import { UserInviteAcceptAll } from '../../../../__generated__/UserInviteAcceptAll'
import i18nConfig from '../../../../next-i18next.config'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import { ACCEPT_USER_INVITE } from '../../..'
import { UserJourneyOpen } from '../../../../__generated__/UserJourneyOpen'
import { JourneyVisitorsList } from '../../../../src/components/JourneyVisitorsList'
import {
  GetJourneyVisitors,
  GetJourneyVisitors_visitors_edges as VisitorEdge
} from '../../../../__generated__/GetJourneyVisitors'
import { GetJourneyVisitorsCount } from '../../../../__generated__/GetJourneyVisitorsCount'

export const GET_JOURNEY_VISITORS = gql`
  query GetJourneyVisitors(
    $filter: JourneyVisitorFilter!
    $first: Int
    $after: String
  ) {
    visitors: journeyVisitorsConnection(
      teamId: "jfp-team"
      filter: $filter
      first: $first
      after: $after
    ) {
      edges {
        cursor
        node {
          visitorId
          countryCode
          createdAt
          duration
          visitor {
            name
            status
            referrer
          }
          events {
            id
            createdAt
            label
            value
          }
        }
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`

export const GET_JOURNEY_VISITORS_COUNT = gql`
  query GetJourneyVisitorsCount($filter: JourneyVisitorFilter!) {
    journeyVisitorCount(filter: $filter)
  }
`

function JourneyVisitorsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const router = useRouter()
  const journeyId = router.query.journeyId as string

  useTermsRedirect()

  const { data } = useQuery<GetJourneyVisitorsCount>(
    GET_JOURNEY_VISITORS_COUNT,
    {
      variables: {
        filter: { journeyId }
      }
    }
  )

  const [visitorEdges, setVisitorEdges] = useState<VisitorEdge[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [endCursor, setEndCursor] = useState<string | null>()

  const { fetchMore, loading } = useQuery<GetJourneyVisitors>(
    GET_JOURNEY_VISITORS,
    {
      variables: {
        filter: { journeyId },
        first: 20
      },
      onCompleted: (data) => {
        setVisitorEdges(data.visitors.edges)
        setHasNextPage(data.visitors.pageInfo.hasNextPage)
        setEndCursor(data.visitors.pageInfo.endCursor)
      }
    }
  )

  async function handleFetchNext(): Promise<void> {
    if (hasNextPage) {
      const response = await fetchMore({
        variables: {
          filter: { journeyId },
          first: 20,
          after: endCursor
        }
      })
      if (response.data.visitors.edges != null) {
        setVisitorEdges([...visitorEdges, ...response.data.visitors.edges])
        setHasNextPage(response.data.visitors.pageInfo.hasNextPage)
        setEndCursor(response.data.visitors.pageInfo.endCursor)
      }
    }
  }

  return (
    <>
      <NextSeo title={t('Visitors')} />
      <PageWrapper
        title={t('Visitors')}
        authUser={AuthUser}
        backHref={`/journeys/${journeyId}/reports`}
      >
        <JourneyVisitorsList
          visitorEdges={visitorEdges}
          visitorsCount={data?.journeyVisitorCount}
          fetchNext={handleFetchNext}
          loading={loading}
          hasNextPage={hasNextPage}
        />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale, query }) => {
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

  try {
    await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: query?.journeyId
      }
    })
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: `/journeys/${query?.journeyId as string}`
      }
    }
  }

  await apolloClient.mutate<UserJourneyOpen>({
    mutation: USER_JOURNEY_OPEN,
    variables: { id: query?.journeyId }
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
})(JourneyVisitorsPage)
