import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

import i18nConfig from '../../next-i18next.config'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { TeamOnboarding } from '../../src/components/Team/TeamOnboarding'
import { createApolloClient } from '../../src/libs/apolloClient'
import { checkConditionalRedirect } from '../../src/libs/checkConditionalRedirect'
import { GET_CURRENT_USER } from '../../src/libs/useCurrentUser'

function TeamsNewPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <NextSeo title={t('New Team')} />
      <OnboardingPageWrapper emailSubject="A question about creating a team for the first time.">
        <TeamOnboarding />
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  if (AuthUser == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

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

  // Needed to populate user team list, do not remove:
  await apolloClient.query({ query: GET_CURRENT_USER })

  const redirect = await checkConditionalRedirect(apolloClient, {
    ...flags,
    teams: false
  })
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
})(TeamsNewPage)
