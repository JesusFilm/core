import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'

import type { GetAdminJourney } from '../../../__generated__/GetAdminJourney'
import type { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { MemoizedDynamicReport } from '../../../src/components/DynamicPowerBiReport'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { PlausibleEmbedDashboard } from '../../../src/components/PlausibleEmbedDashboard'
import { ReportsNavigation } from '../../../src/components/ReportsNavigation'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { GET_ADMIN_JOURNEY, USER_JOURNEY_OPEN } from '../[journeyId]'

function JourneyReportsPage({ flags }): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()

  const journeyId = router.query.journeyId as string

  return (
    <>
      <NextSeo title={t('Journey Analytics')} />
      <PageWrapper
        title={t('Journey Analytics')}
        user={user}
        backHref={`/journeys/${journeyId}`}
        mainHeaderChildren={
          <ReportsNavigation
            destination="visitor"
            journeyId={journeyId}
            helpScoutGap
          />
        }
        mainBodyPadding={false}
      >
        {flags.editorAnalytics === true ? (
          <PlausibleEmbedDashboard />
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
      ...translations,
      flags
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyReportsPage)
