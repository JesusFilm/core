import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

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
import { useIntegrationGoogleCreate } from '../../../../src/components/Google/GoogleCreateIntegration/libs/useIntegrationGoogleCreate'
import { HelpScoutBeacon } from '../../../../src/components/HelpScoutBeacon'
import { JourneyVisitorsList } from '../../../../src/components/JourneyVisitorsList'
import { ExportEventsButton } from '../../../../src/components/JourneyVisitorsList/ExportEventsButton'
import {
  FilterDrawer,
  GET_JOURNEY_BLOCK_TYPENAMES
} from '../../../../src/components/JourneyVisitorsList/FilterDrawer/FilterDrawer'
import { GoogleSheetsSyncDialog } from '../../../../src/components/JourneyVisitorsList/FilterDrawer/GoogleSheetsSyncDialog'
import { GoogleSheetsSyncButton } from '../../../../src/components/JourneyVisitorsList/GoogleSheetsSyncButton'
import { VisitorToolbar } from '../../../../src/components/JourneyVisitorsList/VisitorToolbar/VisitorToolbar'
import { PageWrapper } from '../../../../src/components/PageWrapper'
import { ReportsNavigation } from '../../../../src/components/ReportsNavigation'
import { useAuth } from '../../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../../src/libs/auth/getAuthTokens'
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
  const { enqueueSnackbar } = useSnackbar()
  const { user } = useAuth()
  const router = useRouter()
  const journeyId = router.query.journeyId as string
  const from = router.query.from
  const [showSyncsDialog, setShowSyncsDialog] = useState(false)

  useIntegrationGoogleCreate({
    teamId: journey?.team?.id,
    onSuccess: () => {
      enqueueSnackbar(t('Google integration created successfully'), {
        variant: 'success'
      })
      setShowSyncsDialog(true)
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  })

  useEffect(() => {
    const openSyncDialog = router.query.openSyncDialog === 'true'
    const hasCode = router.query.code != null
    if (openSyncDialog && !hasCode) {
      setShowSyncsDialog(true)
    }
  }, [router.query.openSyncDialog, router.query.code])

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
  const [withMultiselectAnswers, setWithMultiselectAnswers] = useState(false)
  const [withSubmittedText, setWithSubmittedText] = useState(
    router.query.withSubmittedText === 'true'
  )
  const [withIcon, setWithIcon] = useState(false)
  const [hideInteractive, setHideInterActive] = useState(false)
  const [sortSetting, setSortSetting] = useState<'date' | 'duration'>('date')

  const { data: blockTypesData } = useQuery(GET_JOURNEY_BLOCK_TYPENAMES, {
    skip: journeyId == null,
    variables: { id: journeyId }
  })
  const blockTypesLoaded = blockTypesData?.journey?.blockTypenames != null
  const availableBlockTypes: string[] =
    blockTypesData?.journey?.blockTypenames ?? []

  // Reset URL-driven withSubmittedText filter when journey has no TextResponseBlock (NES-1486)
  useEffect(() => {
    if (
      blockTypesLoaded &&
      withSubmittedText &&
      !availableBlockTypes.includes('TextResponseBlock')
    ) {
      setWithSubmittedText(false)
    }
  }, [blockTypesLoaded, availableBlockTypes, withSubmittedText])

  const waitingForBlockTypes = withSubmittedText && !blockTypesLoaded

  const { data: userRoleData } = useUserRoleQuery()
  const { fetchMore, loading: queryLoading } = useQuery<GetJourneyVisitors>(
    GET_JOURNEY_VISITORS,
    {
      skip: waitingForBlockTypes,
      variables: {
        filter: {
          journeyId,
          hasChatStarted: chatStarted,
          hasPollAnswers: withPollAnswers,
          hasMultiselectSubmission: withMultiselectAnswers,
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
  const loading = queryLoading || waitingForBlockTypes

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
        (userTeam) =>
          userTeam.user.__typename === 'AuthenticatedUser' &&
          userTeam.user.email === user?.email
      ),
    [journey?.team, userTeamsData?.userTeams, user?.email]
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
      case 'Multiselect Answers':
        setWithMultiselectAnswers(e.target.checked as boolean)
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
    setWithMultiselectAnswers(false)
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
        user={user ?? undefined}
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
              withMultiselectAnswers={withMultiselectAnswers}
              withSubmittedText={withSubmittedText}
              withIcon={withIcon}
              hideInteractive={hideInteractive}
              handleClearAll={handleClearAll}
            />
            <GoogleSheetsSyncButton
              disabled={!enableExportButton}
              onSyncClick={() => setShowSyncsDialog(true)}
            />
            <ExportEventsButton
              journeyId={journeyId}
              disabled={!enableExportButton}
            />
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
            withMultiselectAnswers={withMultiselectAnswers}
            withSubmittedText={withSubmittedText}
            withIcon={withIcon}
            hideInteractive={hideInteractive}
            handleClearAll={handleClearAll}
            disableExportButton={!enableExportButton}
            onSyncDialogOpen={() => setShowSyncsDialog(true)}
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
        <GoogleSheetsSyncDialog
          open={showSyncsDialog}
          onClose={() => setShowSyncsDialog(false)}
          journeyId={journeyId}
        />
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

  let journey: Journey | null = null

  try {
    const { data } = await apolloClient.query<GetAdminJourney>({
      query: GET_ADMIN_JOURNEY,
      variables: {
        id: ctx.query?.journeyId
      }
    })

    journey = data?.journey
  } catch (_) {
    return {
      redirect: {
        permanent: false,
        destination: `/journeys/${ctx.query?.journeyId as string}`
      }
    }
  }

  await apolloClient.mutate<UserJourneyOpen>({
    mutation: USER_JOURNEY_OPEN,
    variables: { id: ctx.query?.journeyId }
  })

  return {
    props: {
      userSerialized: JSON.stringify(user),
      ...translations,
      journey
    }
  }
}

export default JourneyVisitorsPage
