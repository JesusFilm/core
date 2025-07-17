import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useMemo, useState } from 'react'

import { useUserRoleQuery } from '@core/journeys/ui/useUserRoleQuery'

import {
  GetAdminJourney,
  GetAdminJourney_journey as Journey
} from '../../../../__generated__/GetAdminJourney'
import {
  GetJourneyVisitors,
  GetJourneyVisitors_visitors_edges as VisitorEdge
} from '../../../../__generated__/GetJourneyVisitors'
import {
  Role,
  UserJourneyRole,
  UserTeamRole
} from '../../../../__generated__/globalTypes'
import { UserJourneyOpen } from '../../../../__generated__/UserJourneyOpen'
import { HelpScoutBeacon } from '../../../../src/components/HelpScoutBeacon'
import { JourneyVisitorsList } from '../../../../src/components/JourneyVisitorsList'
import { ExportEventsButton } from '../../../../src/components/JourneyVisitorsList/ExportEventsButton'
import { FilterDrawer } from '../../../../src/components/JourneyVisitorsList/FilterDrawer/FilterDrawer'
import { VisitorToolbar } from '../../../../src/components/JourneyVisitorsList/VisitorToolbar/VisitorToolbar'
import { PageWrapper } from '../../../../src/components/PageWrapper'
import { ReportsNavigation } from '../../../../src/components/ReportsNavigation'
import { initAndAuthApp } from '../../../../src/libs/initAndAuthApp'
import { useUserTeamsAndInvitesQuery } from '../../../../src/libs/useUserTeamsAndInvitesQuery'
import { GET_ADMIN_JOURNEY, USER_JOURNEY_OPEN } from '../../[journeyId]'

export const GET_JOURNEY_VISITORS = gql`
  query GetJourneyVisitors(
    $filter: JourneyVisitorFilter!
    $sort: JourneyVisitorSort
    $first: Int
    $after: String
  ) {
    visitors: journeyVisitorsConnection(
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
            ... on TextResponseSubmissionEvent {
              id
              blockId
            }
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

interface JourneyVisitorsPageProps {
  journey: Journey
}

function JourneyVisitorsPage({
  journey
}: JourneyVisitorsPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()
  const journeyId = router.query.journeyId as string
  const from = router.query.from

  // Hide visitors count
  // const { data } = useQuery<GetJourneyVisitorsCount>(
  //   GET_JOURNEY_VISITORS_COUNT,
  //   {
  //     variables: {
  //       filter: { journeyId }
  //     }
  //   }
  // )

  const [visitorEdges, setVisitorEdges] = useState<VisitorEdge[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [endCursor, setEndCursor] = useState<string | null>()
  const [chatStarted, setChatStarted] = useState(false)
  const [withPollAnswers, setWithPollAnswers] = useState(false)
  const [withSubmittedText, setWithSubmittedText] = useState(
    router.query.withSubmittedText === 'true'
  )
  const [withIcon, setWithIcon] = useState(false)
  const [hideInteractive, setHideInterActive] = useState(false)
  const [sortSetting, setSortSetting] = useState<'date' | 'duration'>('date')

  const { data: userRoleData } = useUserRoleQuery()
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
  const { data: userTeamsData } = useUserTeamsAndInvitesQuery(
    journey?.team != null
      ? {
          teamId: journey?.team.id,
          where: { role: [UserTeamRole.manager, UserTeamRole.member] }
        }
      : undefined
  )

  async function handleFetchNext(): Promise<void> {
    if (visitorEdges != null && hasNextPage) {
      const response = await fetchMore({
        variables: {
          filter: { journeyId },
          first: 100,
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

  const owner = useMemo(
    () =>
      journey.userJourneys?.find(
        (userJourney) => userJourney.role === UserJourneyRole.owner
      ),
    [journey.userJourneys]
  )
  const isOwner = useMemo(
    () => owner?.user?.id === user?.id,
    [owner?.user?.id, user?.id]
  )

  const isPublisher = useMemo(
    () => userRoleData?.getUserRole?.roles?.includes(Role.publisher),
    [userRoleData?.getUserRole?.roles]
  )

  const userInTeam = useMemo(
    () =>
      !!journey?.team &&
      !!userTeamsData?.userTeams?.some(
        (userTeam) => userTeam.user.email === user.email
      ),
    [journey?.team, userTeamsData?.userTeams, user.email]
  )

  const enableExportButton = journey.template
    ? isPublisher
    : userInTeam || isOwner

  const handleChange = async (e): Promise<void> => {
    switch (e.target.value) {
      case 'Chat Started':
        setChatStarted(e.target.checked as boolean)
        break
      case 'Poll Answers':
        setWithPollAnswers(e.target.checked as boolean)
        break
      case 'Submitted Text':
        setWithSubmittedText(e.target.checked as boolean)
        break
      case 'Icon':
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
        title={t('Visitors')}
        user={user}
        backHref={
          from === 'journey-list'
            ? `/journeys/${journeyId}/reports?from=journey-list`
            : `/journeys/${journeyId}/reports`
        }
        mainHeaderChildren={
          <Stack
            direction="row"
            flexGrow={1}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Hide visitors count */}
            {/* {data?.journeyVisitorCount != null && (
              <Typography variant="caption" sx={{ pl: 4 }}>
                {data?.journeyVisitorCount}
              </Typography>
            )} */}
            <ReportsNavigation destination="journey" journeyId={journeyId} />
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
            {
              <ExportEventsButton
                journeyId={journeyId}
                disabled={!enableExportButton}
              />
            }
          </Stack>
        }
        sidePanelTitle={
          <>
            <Typography variant="subtitle1">{t('Refine Results')}</Typography>
            <HelpScoutBeacon
              userInfo={{
                name: user?.displayName ?? '',
                email: user?.email ?? ''
              }}
            />
          </>
        }
        sidePanelChildren={
          <FilterDrawer
            journeyId={journeyId}
            handleChange={handleChange}
            sortSetting={sortSetting}
            chatStarted={chatStarted}
            withPollAnswers={withPollAnswers}
            withSubmittedText={withSubmittedText}
            withIcon={withIcon}
            hideInteractive={hideInteractive}
            handleClearAll={handleClearAll}
            disableExportButton={!enableExportButton}
          />
        }
      >
        <JourneyVisitorsList
          visitorEdges={visitorEdges}
          visitorsCount={undefined} // Hide data?.journeyVisitorCount
          fetchNext={handleFetchNext}
          loading={loading}
          hasNextPage={hasNextPage}
        />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, query, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  let journey: Journey | null = null

  try {
    const { data } = await apolloClient.query<GetAdminJourney>({
      query: GET_ADMIN_JOURNEY,
      variables: {
        id: query?.journeyId
      }
    })

    journey = data?.journey
  } catch (_) {
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
      ...translations,
      journey
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyVisitorsPage)
