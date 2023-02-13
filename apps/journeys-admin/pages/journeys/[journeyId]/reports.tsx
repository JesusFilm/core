import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { PageWrapper } from '../../../src/components/PageWrapper'
import i18nConfig from '../../../next-i18next.config'
import { MemoizedDynamicReport } from '../../../src/components/DynamicPowerBiReport'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { useUserJourneyOpen } from '../../../src/libs/useUserJourneyOpen'

function JourneyReportsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const router = useRouter()
  const { journey } = useJourney()

  const journeyId = router.query.journeyId as string

  useUserJourneyOpen(AuthUser.id, journey?.id, journey?.userJourneys)

  return (
    <>
      <NextSeo title={t('Journey Report')} />
      <PageWrapper
        title={t('Journey Report')}
        authUser={AuthUser}
        backHref={`/journeys/${journeyId}`}
        router={router}
      >
        <Box sx={{ height: 'calc(100vh - 48px)' }}>
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
})(async ({ AuthUser, locale }) => {
  const ldUser = {
    key: AuthUser.id as string,
    firstName: AuthUser.displayName ?? undefined,
    email: AuthUser.email ?? undefined
  }
  const launchDarklyClient = await getLaunchDarklyClient(ldUser)
  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }
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
})(JourneyReportsPage)
