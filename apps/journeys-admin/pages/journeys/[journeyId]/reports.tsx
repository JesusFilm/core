import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useRef, useState } from 'react'

import { openBeacon, setBeaconRoute } from '@core/journeys/ui/beaconHooks'

import { GetAdminJourney } from '../../../__generated__/GetAdminJourney'
import { GetPlausibleDashboardViewed } from '../../../__generated__/GetPlausibleDashboardViewed'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import {
  UpdatePlausibleDashboardViewed,
  UpdatePlausibleDashboardViewedVariables
} from '../../../__generated__/UpdatePlausibleDashboardViewed'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { MemoizedDynamicReport } from '../../../src/components/DynamicPowerBiReport'
import { HelpScoutBeacon } from '../../../src/components/HelpScoutBeacon'
import { NotificationPopover } from '../../../src/components/NotificationPopover'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { PlausibleEmbedDashboard } from '../../../src/components/PlausibleEmbedDashboard'
import { ReportsNavigation } from '../../../src/components/ReportsNavigation'
import { useAuth } from '../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { GET_ADMIN_JOURNEY, USER_JOURNEY_OPEN } from '../[journeyId]'

export const GET_PLAUSIBLE_DASHBOARD_VIEWED = gql`
  query GetPlausibleDashboardViewed {
    getJourneyProfile {
      id
      plausibleDashboardViewed
    }
  }
`

export const UPDATE_PLAUSIBLE_DASHBOARD_VIEWED = gql`
  mutation UpdatePlausibleDashboardViewed($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
      plausibleDashboardViewed
    }
  }
`

function JourneyReportsPage({ flags, plausibleDashboardViewed }): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const router = useRouter()

  const ref = useRef(null)
  const currentRef = ref.current

  const [updatePlausibleDashboardViewed] = useMutation<
    UpdatePlausibleDashboardViewed,
    UpdatePlausibleDashboardViewedVariables
  >(UPDATE_PLAUSIBLE_DASHBOARD_VIEWED, {
    variables: {
      input: {
        plausibleDashboardViewed: true
      }
    }
  })

  const [open, setOpen] = useState(plausibleDashboardViewed !== true)

  const journeyId = router.query.journeyId as string
  const from = router.query.from

  return (
    <>
      <NextSeo title={t('Journey Analytics')} />
      <PageWrapper
        title={t('Journey Analytics')}
        user={user ?? undefined}
        backHref={from === 'journey-list' ? '/' : `/journeys/${journeyId}`}
        mainHeaderChildren={
          <Stack
            direction="row"
            justifyContent="flex-end"
            flexGrow={1}
            alignItems="center"
            gap={3}
          >
            <ReportsNavigation destination="visitor" journeyId={journeyId} />
            <Box ref={ref} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <HelpScoutBeacon
                userInfo={{
                  name: user?.displayName ?? '',
                  email: user?.email ?? ''
                }}
              />
            </Box>
          </Stack>
        }
        mainBodyPadding={false}
      >
        {flags.editorAnalytics === true ? (
          <>
            <PlausibleEmbedDashboard />
            <NotificationPopover
              open={open}
              title={t('New Feature Feedback')}
              description={t(
                'We are collecting feedback on the new analytics feature. Please take a moment to share your thoughts.'
              )}
              currentRef={currentRef}
              pointerPosition="92%"
              handleClose={() => {
                void updatePlausibleDashboardViewed()
                setBeaconRoute('/ask/')
                setOpen(false)
              }}
              popoverAction={{
                label: t('Feedback'),
                handleClick: () => {
                  openBeacon()
                }
              }}
            />
          </>
        ) : (
          <MemoizedDynamicReport
            reportType={JourneysReportType.singleFull}
            journeyId={journeyId}
          />
        )}
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)
  const user = toUser(tokens)

  const { apolloClient, redirect, translations, flags } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  try {
    await apolloClient.query<GetAdminJourney>({
      query: GET_ADMIN_JOURNEY,
      variables: {
        id: ctx.query?.journeyId
      }
    })
  } catch (_) {
    return {
      redirect: {
        permanent: false,
        destination: `/journeys/${ctx.query?.journeyId as string}`
      }
    }
  }
  const { data } = await apolloClient.query<GetPlausibleDashboardViewed>({
    query: GET_PLAUSIBLE_DASHBOARD_VIEWED
  })
  await apolloClient.mutate<UserJourneyOpen>({
    mutation: USER_JOURNEY_OPEN,
    variables: { id: ctx.query?.journeyId }
  })

  return {
    props: {
      userSerialized: JSON.stringify(user),
      ...translations,
      flags,
      plausibleDashboardViewed: data.getJourneyProfile?.plausibleDashboardViewed
    }
  }
}

export default JourneyReportsPage
