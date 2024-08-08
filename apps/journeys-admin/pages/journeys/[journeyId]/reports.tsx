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
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { MemoizedDynamicReport } from '../../../src/components/DynamicPowerBiReport'
import { HelpScoutBeacon } from '../../../src/components/HelpScoutBeacon'
import { NotificationPopover } from '../../../src/components/NotificationPopover'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { PlausibleEmbedDashboard } from '../../../src/components/PlausibleEmbedDashboard'
import { ReportsNavigation } from '../../../src/components/ReportsNavigation'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { GET_ADMIN_JOURNEY, USER_JOURNEY_OPEN } from '../[journeyId]'

function JourneyReportsPage({ flags }): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()

  const ref = useRef(null)
  const currentRef = ref.current
  const [open, setOpen] = useState(true)

  const journeyId = router.query.journeyId as string

  return (
    <>
      <NextSeo title={t('Journey Analytics')} />
      <PageWrapper
        title={t('Journey Analytics')}
        user={user}
        backHref={`/journeys/${journeyId}`}
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
              title={t('New Feature Feedback')}
              description={t(
                'We are collecting feedback on the new analytics feature. Please take a moment to share your thoughts.'
              )}
              open={open}
              currentRef={currentRef}
              pointerPosition="92%"
              handleClose={() => {
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

  await apolloClient.mutate<UserJourneyOpen>({
    mutation: USER_JOURNEY_OPEN,
    variables: { id: query?.journeyId }
  })

  return {
    props: {
      ...translations,
      flags
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyReportsPage)
