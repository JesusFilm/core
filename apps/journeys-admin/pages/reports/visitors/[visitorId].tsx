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

import { PageWrapper } from '../../../src/components/NewPageWrapper'
import { VisitorInfo } from '../../../src/components/VisitorInfo'
import { DetailsForm } from '../../../src/components/VisitorInfo/DetailsForm'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

function SingleVisitorReportsPage(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()

  const id = router.query.visitorId as string

  return (
    <>
      <NextSeo title={t('Visitor Info')} />
      <PageWrapper
        title={t("Visitor's Activity")}
        backHref="/reports/visitors"
        authUser={AuthUser}
        sidePanelChildren={<DetailsForm id={id} />}
        sidePanelTitle={t('Visitor Details')}
        backHrefHistory
      >
        <VisitorInfo id={id} />
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
})(SingleVisitorReportsPage)
