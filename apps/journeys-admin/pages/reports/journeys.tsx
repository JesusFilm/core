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
import { PageWrapper } from '../../src/components/NewPageWrapper'
import i18nConfig from '../../next-i18next.config'
import { MemoizedDynamicReport } from '../../src/components/DynamicPowerBiReport'
import { JourneysReportType } from '../../__generated__/globalTypes'
import { ReportsNavigation } from '../../src/components/ReportsNavigation'
import { createApolloClient } from '../../src/libs/apolloClient'
import { checkConditionalRedirect } from '../../src/libs/checkConditionalRedirect'

function ReportsJourneysPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()

  return (
    <>
      <NextSeo title={t('Journeys Report')} />
      <PageWrapper title={t('Journeys Report')} authUser={AuthUser}>
        <Box sx={{ height: 'calc(100vh - 48px)' }}>
          <ReportsNavigation
            reportType={JourneysReportType.multipleFull}
            selected="journeys"
          />
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

  const token = await AuthUser.getIdToken()
  const apolloClient = createApolloClient(token != null ? token : '')

  const redirect = await checkConditionalRedirect(apolloClient, flags)
  if (redirect != null) return { redirect }
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
