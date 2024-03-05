import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useState } from 'react'

import { GetAdminJourney } from '../../../../__generated__/GetAdminJourney'
import {
  GetJourneyVisitors,
  GetJourneyVisitors_visitors_edges as VisitorEdge
} from '../../../../__generated__/GetJourneyVisitors'
import { UserJourneyOpen } from '../../../../__generated__/UserJourneyOpen'
import { JourneyVisitorsList } from '../../../../src/components/JourneyVisitorsList'
import { ClearAllButton } from '../../../../src/components/JourneyVisitorsList/FilterDrawer/ClearAllButton'
import { FilterDrawer } from '../../../../src/components/JourneyVisitorsList/FilterDrawer/FilterDrawer'
import { VisitorToolbar } from '../../../../src/components/JourneyVisitorsList/VisitorToolbar/VisitorToolbar'
import { PageWrapper } from '../../../../src/components/PageWrapper'
import { initAndAuthApp } from '../../../../src/libs/initAndAuthApp'
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
  const user = useUser()
  const router = useRouter()
  const journeyId = router.query.journeyId as string

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
        title={t('Visitors')}
        user={user}
        backHref={`/journeys/${journeyId}/reports`}
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
          </Stack>
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

  try {
    await apolloClient.query<GetAdminJourney>({
      query: GET_ADMIN_JOURNEY,
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
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyVisitorsPage)
