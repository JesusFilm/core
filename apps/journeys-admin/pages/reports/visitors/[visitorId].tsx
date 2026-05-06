import Typography from '@mui/material/Typography'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { HelpScoutBeacon } from '../../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { VisitorInfo } from '../../../src/components/VisitorInfo'
import { DetailsForm } from '../../../src/components/VisitorInfo/DetailsForm'
import { useAuth } from '../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

export default function SingleVisitorReportsPage(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  const id = router.query.visitorId as string
  const journeyId = router.query.journeyId

  return (
    <>
      <NextSeo title={t('Visitor Info')} />
      <PageWrapper
        title={t("Visitor's Activity")}
        backHref={`/journeys/${journeyId as string}/reports/visitors`}
        user={user ?? undefined}
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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)
  const user = toUser(tokens)

  const { redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      ...translations
    }
  }
}
