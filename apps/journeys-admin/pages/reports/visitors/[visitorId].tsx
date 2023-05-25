import { ReactElement, useEffect, useRef } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { VisitorInfo } from '../../../src/components/VisitorInfo'
import { PageWrapper } from '../../../src/components/NewPageWrapper'
import i18nConfig from '../../../next-i18next.config'
import { useTermsRedirect } from '../../../src/libs/useTermsRedirect/useTermsRedirect'

function SingleVisitorReportsPage(): ReactElement {
  const historyRef = useRef<boolean | undefined>(undefined)
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()

  useEffect(() => {
    document.referrer === ''
      ? (historyRef.current = true)
      : (historyRef.current = false)
  }, [historyRef])

  useTermsRedirect()

  return (
    <>
      <NextSeo title={t('Visitor Info')} />
      <PageWrapper
        title={t('Visitor Info')}
        authUser={AuthUser}
        backHrefHistory={historyRef.current}
        backHref="/reports/visitors"
      >
        <VisitorInfo id={router.query.visitorId as string} />
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
})(SingleVisitorReportsPage)
