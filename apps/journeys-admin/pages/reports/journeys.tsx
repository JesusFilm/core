import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import Box from '@mui/material/Box'
import { PageWrapper } from '../../src/components/PageWrapper'
import i18nConfig from '../../next-i18next.config'
import { MemoizedDynamicReport } from '../../src/components/DynamicPowerBiReport'
import { JourneysReportType } from '../../__generated__/globalTypes'
import { useTermsRedirect } from '../../src/libs/useTermsRedirect/useTermsRedirect'
import { ReportsNavigation } from '../../src/components/ReportsNavigation'

function ReportsJourneysPage(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()

  useTermsRedirect()

  return (
    <>
      <NextSeo title={t('Journeys Report')} />
      <PageWrapper
        title={t('Journeys Report')}
        authUser={AuthUser}
        router={router}
      >
        <Box sx={{ height: 'calc(100vh - 48px)' }}>
          <ReportsNavigation selected="journeys" />
          <MemoizedDynamicReport reportType={JourneysReportType.multipleFull} />
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
})(ReportsJourneysPage)
