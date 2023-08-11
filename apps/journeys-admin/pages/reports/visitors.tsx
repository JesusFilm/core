import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { PageWrapper } from '../../src/components/NewPageWrapper'
import { ReportsNavigation } from '../../src/components/ReportsNavigation'
import { VisitorsList } from '../../src/components/VisitorsList'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function ReportsVisitorsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()

  return (
    <>
      <NextSeo title={t('Visitors Report')} />
      <PageWrapper title={t('Visitors Report')} authUser={AuthUser}>
        <ReportsNavigation selected="visitors" />
        <VisitorsList />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
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

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ReportsVisitorsPage)
