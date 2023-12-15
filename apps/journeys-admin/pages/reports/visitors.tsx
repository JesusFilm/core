import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { PageWrapper } from '../../src/components/PageWrapper'
import { ReportsNavigation } from '../../src/components/ReportsNavigation'
import { VisitorsList } from '../../src/components/VisitorsList'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function ReportsVisitorsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  return (
    <>
      <NextSeo title={t('Visitors Analytics')} />
      <PageWrapper title={t('Visitors Analytics')} user={user}>
        <ReportsNavigation selected="visitors" />
        <VisitorsList />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ReportsVisitorsPage)
