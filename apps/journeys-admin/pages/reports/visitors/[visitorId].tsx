import { ReactElement } from 'react'
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
import { DetailsForm } from '../../../src/components/VisitorInfo/DetailsForm'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { checkConditionalRedirect } from '../../../src/libs/checkConditionalRedirect'

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
  const ldUser = {
    key: AuthUser.id as string,
    firstName: AuthUser.displayName ?? undefined,
    email: AuthUser.email ?? undefined
  }
  const launchDarklyClient = await getLaunchDarklyClient(ldUser)
  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }

  const token = await AuthUser.getIdToken()
  const apolloClient = createApolloClient(token != null ? token : '')

  const redirect = await checkConditionalRedirect(apolloClient, flags)
  if (redirect != null) return { redirect }

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
