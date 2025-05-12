import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
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
  const user = useUser()
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
        user={user}
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

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, query, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, redirect, translations, flags } = await initAndAuthApp({
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
  } catch (_) {
    return {
      redirect: {
        permanent: false,
        destination: `/journeys/${query?.journeyId as string}`
      }
    }
  }
  const { data } = await apolloClient.query<GetPlausibleDashboardViewed>({
    query: GET_PLAUSIBLE_DASHBOARD_VIEWED
  })
  await apolloClient.mutate<UserJourneyOpen>({
    mutation: USER_JOURNEY_OPEN,
    variables: { id: query?.journeyId }
  })

  return {
    props: {
      ...translations,
      flags,
      plausibleDashboardViewed: data.getJourneyProfile?.plausibleDashboardViewed
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyReportsPage)
