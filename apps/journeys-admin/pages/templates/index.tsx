import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { PageWrapper } from '../../src/components/PageWrapper'
import i18nConfig from '../../next-i18next.config'
import { useJourneys } from '../../src/libs/useJourneys'
import { TemplateLibrary } from '../../src/components/TemplateLibrary'
import { GetUserRole } from '../../__generated__/GetUserRole'
import { Role } from '../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../../src/components/JourneyView/JourneyView'
import { useTermsRedirect } from '../../src/libs/useTermsRedirect/useTermsRedirect'

function LibraryIndex(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const { data } = useJourneys({ template: true })
  const { data: userData } = useQuery<GetUserRole>(GET_USER_ROLE)

  const isPublisher = userData?.getUserRole?.roles?.includes(Role.publisher)

  useTermsRedirect()

  return (
    <>
      <NextSeo title={t('Journey Templates')} />
      <PageWrapper title={t('Journey Templates')} authUser={AuthUser}>
        <TemplateLibrary isPublisher={isPublisher} templates={data?.journeys} />
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
})(LibraryIndex)
