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
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { PageWrapper } from '../../../../src/components/NewPageWrapper'
import { GetJourney } from '../../../../__generated__/GetJourney'
import { GET_JOURNEY, USER_JOURNEY_OPEN } from '../../[journeyId]'
import { ACCEPT_ALL_INVITES } from '../../..'
import { UserJourneyOpen } from '../../../../__generated__/UserJourneyOpen'
import { JourneyVisitorsList } from '../../../../src/components/JourneyVisitorsList'
import {
  GetJourneyVisitors,
  GetJourneyVisitors_visitors_edges as VisitorEdge
} from '../../../../__generated__/GetJourneyVisitors'
import { GetJourneyVisitorsCount } from '../../../../__generated__/GetJourneyVisitorsCount'
import { FilterDrawer } from '../../../../src/components/JourneyVisitorsList/FilterDrawer/FilterDrawer'
import { VisitorToolbar } from '../../../../src/components/JourneyVisitorsList/VisitorToolbar/VisitorToolbar'
import { ClearAllButton } from '../../../../src/components/JourneyVisitorsList/FilterDrawer/ClearAllButton'
import { initAndAuthApp } from '../../../../src/libs/initAndAuthApp'
import { AcceptAllInvites } from '../../../../__generated__/AcceptAllInvites'
import { useTeam } from '../../../../src/components/Team/TeamProvider'

export const GET_JOURNEY_VISITORS = gql`
  query GetJourneyVisitors(
    $filter: JourneyVisitorFilter!
    $sort: JourneyVisitorSort
    $first: Int
    $after: String
    $teamId: String!
  ) {
    visitors: journeyVisitorsConnection(
      teamId: $teamId
      filter: $filter
      sort: $sort
      first: $first
      after: $after
    ) {
      edges {
        cursor
        node {
          visitorId
          createdAt
          duration
          visitor {
            name
            status
            countryCode
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
  const { activeTeam } = useTeam()
  const journeyId = router.query.journeyId as string

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
  const [chatStarted, setChatStarted] = useState(false)
  const [withPollAnswers, setWithPollAnswers] = useState(false)
  const [withSubmittedText, setWithSubmittedText] = useState(false)
  const [withIcon, setWithIcon] = useState(false)
  const [hideInteractive, setHideInterActive] = useState(false)
  const [sortSetting, setSortSetting] = useState<'date' | 'duration'>('date')

  const { fetchMore, loading } = useQuery<GetJourneyVisitors>(
    GET_JOURNEY_VISITORS,
    {
      variables: {
        filter: {
          journeyId,
          hasChatStarted: chatStarted,
          hasPollAnswers: withPollAnswers,
          hasTextResponse: withSubmittedText,
          hasIcon: withIcon,
          hideInactive: hideInteractive
        },
        first: 100,
        sort: sortSetting
      },
      onCompleted: (data) => {
        setVisitorEdges(data.visitors.edges)
        setHasNextPage(data.visitors.pageInfo.hasNextPage)
        setEndCursor(data.visitors.pageInfo.endCursor)
      }
    }
  )

  async function handleFetchNext(): Promise<void> {
    if (visitorEdges != null && hasNextPage && activeTeam != null) {
      const response = await fetchMore({
        variables: {
          filter: { journeyId },
          first: 100,
          after: endCursor,
          teamId: activeTeam.id
        }
      })
      if (response.data.visitors.edges != null) {
        setVisitorEdges([...visitorEdges, ...response.data.visitors.edges])
        setHasNextPage(response.data.visitors.pageInfo.hasNextPage)
        setEndCursor(response.data.visitors.pageInfo.endCursor)
      }
    }
  }

  const handleChange = async (e): Promise<void> => {
    switch (e.target.value) {
      case 'Chat Started':
        setChatStarted(e.target.checked as boolean)
        break
      case 'With Poll Answers':
        setWithPollAnswers(e.target.checked as boolean)
        break
      case 'With Submitted Text':
        setWithSubmittedText(e.target.checked as boolean)
        break
      case 'With Icon':
        setWithIcon(e.target.checked as boolean)
        break
      case 'Hide Inactive':
        setHideInterActive(e.target.checked as boolean)
        break
      case 'date':
        setSortSetting('date')
        break
      case 'duration':
        setSortSetting('duration')
        break
    }
  }

  const handleClearAll = (): void => {
    setChatStarted(false)
    setWithPollAnswers(false)
    setWithSubmittedText(false)
    setWithIcon(false)
    setHideInterActive(false)
    setSortSetting('date')
  }

  return (
    <>
      <NextSeo title={t('Visitors')} />
      <PageWrapper
        title={
          <Stack direction="row" alignItems="center">
            {t('Visitors')}
            {data?.journeyVisitorCount != null && (
              <Typography variant="caption" sx={{ pl: 4 }}>
                {data?.journeyVisitorCount}
              </Typography>
            )}
          </Stack>
        }
        authUser={AuthUser}
        backHref={`/journeys/${journeyId}/reports`}
        menu={
          <VisitorToolbar
            handleChange={handleChange}
            sortSetting={sortSetting}
            chatStarted={chatStarted}
            withPollAnswers={withPollAnswers}
            withSubmittedText={withSubmittedText}
            withIcon={withIcon}
            hideInteractive={hideInteractive}
            handleClearAll={handleClearAll}
          />
        }
        sidePanelTitle={
          <>
            {t('Filters')}
            <ClearAllButton handleClearAll={handleClearAll} />
          </>
        }
        sidePanelChildren={
          <FilterDrawer
            handleChange={handleChange}
            sortSetting={sortSetting}
            chatStarted={chatStarted}
            withPollAnswers={withPollAnswers}
            withSubmittedText={withSubmittedText}
            withIcon={withIcon}
            hideInteractive={hideInteractive}
          />
        }
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
  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
    locale
  })

  if (redirect != null) return { redirect }

  await apolloClient.mutate<AcceptAllInvites>({
    mutation: ACCEPT_ALL_INVITES
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
      ...translations
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyVisitorsPage)
