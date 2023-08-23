import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ACCEPT_ALL_INVITES } from '../..'
import { AcceptAllInvites } from '../../../__generated__/AcceptAllInvites'
import { GetJourney } from '../../../__generated__/GetJourney'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { MemoizedDynamicReport } from '../../../src/components/DynamicPowerBiReport'
import { PageWrapper } from '../../../src/components/NewPageWrapper'
import { ReportsNavigation } from '../../../src/components/ReportsNavigation'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { GET_JOURNEY, USER_JOURNEY_OPEN } from '../[journeyId]'

function JourneyReportsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const router = useRouter()

  const journeyId = router.query.journeyId as string

  return (
    <>
      <NextSeo title={t('Journey Report')} />
      <PageWrapper
        title={t('Journey Report')}
        authUser={AuthUser}
        backHref={`/journeys/${journeyId}`}
      >
        <Box sx={{ height: 'calc(100vh - 48px)' }}>
          <ReportsNavigation
            reportType={JourneysReportType.singleFull}
            journeyId={journeyId}
            selected="journeys"
          />
          <MemoizedDynamicReport
            reportType={JourneysReportType.singleFull}
            journeyId={journeyId}
          />
        </Box>
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale, query }) => {
  if (AuthUser == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

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
})(JourneyReportsPage)
