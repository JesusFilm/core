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
import dynamic from 'next/dynamic'
import { PageWrapper } from '../../src/components/PageWrapper'
import i18nConfig from '../../next-i18next.config'

function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()

  // powerbi needs dynamic import, see issue: https://github.com/microsoft/powerbi-client-react/issues/65
  const AnalyticsFullReport = dynamic(
    async () =>
      await import(
        /* webpackChunkName: "DynamicAnalyticsFullReport" */
        '../../src/components/AnalyticsFullReport'
      ).then((res) => res.AnalyticsFullReport),
    { ssr: false }
  )

  return (
    <>
      <NextSeo title={t('Anayltics')} />
      <PageWrapper title={t('Anayltics')} authUser={AuthUser}>
        <AnalyticsFullReport />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ locale }) => {
  return {
    props: {
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
})(IndexPage)
