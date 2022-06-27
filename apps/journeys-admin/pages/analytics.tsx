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
import { PageWrapper } from '../src/components/PageWrapper'
import i18nConfig from '../next-i18next.config'
import { PowerBiReport } from '../src/components/PowerBiReport'
import { JourneysReportType } from '../__generated__/globalTypes'

function AnalyticsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()

  return (
    <>
      <NextSeo title={t('Analytics')} />
      <PageWrapper title={t('Analytics')} authUser={AuthUser}>
        <Box
          sx={{
            height: '93vh',
            '> div': { height: '100%' }
          }}
        >
          <PowerBiReport reportType={JourneysReportType.multipleFull} />
        </Box>
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  const launchDarklyClient = await getLaunchDarklyClient()
  const flags = (
    await launchDarklyClient.allFlagsState({
      key: AuthUser.id as string,
      firstName: AuthUser.displayName ?? undefined,
      email: AuthUser.email ?? undefined
    })
  ).toJSON() as { [key: string]: boolean | undefined }
  if (flags.analytics !== true) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    }
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
})(AnalyticsPage)
