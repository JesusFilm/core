import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { HelpScoutBeacon } from '../../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { VisitorInfo } from '../../../src/components/VisitorInfo'
import { DetailsForm } from '../../../src/components/VisitorInfo/DetailsForm'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

function SingleVisitorReportsPage(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  const id = router.query.visitorId as string
  const journeyId = router.query.journeyId

  return (
    <>
      <NextSeo title={t('Visitor Info')} />
      <PageWrapper
        title={t("Visitor's Activity")}
        backHref={`/journeys/${journeyId as string}/reports/visitors`}
        user={user}
        sidePanelChildren={<DetailsForm id={id} />}
        sidePanelTitle={
          <>
            <Typography variant="subtitle1">{t('Visitor Details')}</Typography>
            <HelpScoutBeacon
              userInfo={{
                name: user?.displayName ?? '',
                email: user?.email ?? ''
              }}
            />
          </>
        }
        backHrefHistory={journeyId != null ? undefined : true}
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
})(SingleVisitorReportsPage)
