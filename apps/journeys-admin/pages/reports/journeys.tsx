import Box from '@mui/material/Box'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneysReportType } from '../../__generated__/globalTypes'
import { MemoizedDynamicReport } from '../../src/components/DynamicPowerBiReport'
import { PageWrapper } from '../../src/components/NewPageWrapper'
import { ReportsNavigation } from '../../src/components/ReportsNavigation'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function ReportsJourneysPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useUser()

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

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user: AuthUser, locale }) => {
  if (AuthUser == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
    locale
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      flags,
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ReportsJourneysPage)
