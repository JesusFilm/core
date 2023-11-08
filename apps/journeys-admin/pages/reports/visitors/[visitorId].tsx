import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { PageWrapper } from '../../../src/components/NewPageWrapper'
import { VisitorInfo } from '../../../src/components/VisitorInfo'
import { DetailsForm } from '../../../src/components/VisitorInfo/DetailsForm'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

function SingleVisitorReportsPage(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  const id = router.query.visitorId as string

  return (
    <>
      <NextSeo title={t('Visitor Info')} />
      <PageWrapper
        title={t("Visitor's Activity")}
        backHref="/reports/visitors"
        user={user}
        sidePanelChildren={<DetailsForm id={id} />}
        sidePanelTitle={t('Visitor Details')}
        backHrefHistory
      >
        <VisitorInfo id={id} />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { flags, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
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
})(SingleVisitorReportsPage)
