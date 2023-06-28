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
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { gql } from '@apollo/client'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { UserInviteAcceptAll } from '../__generated__/UserInviteAcceptAll'
import { JourneyList } from '../src/components/JourneyList'
import { PageWrapper } from '../src/components/NewPageWrapper'
import { createApolloClient } from '../src/libs/apolloClient'
import i18nConfig from '../next-i18next.config'
import { useTermsRedirect } from '../src/libs/useTermsRedirect/useTermsRedirect'
import { OnboardingPanelContent } from '../src/components/OnboardingPanelContent'
import { TeamSelect } from '../src/components/Team/TeamSelect'
import { TeamMenu } from '../src/components/Team/TeamMenu'

export const ACCEPT_USER_INVITE = gql`
  mutation UserInviteAcceptAll {
    userInviteAcceptAll {
      id
      acceptedAt
    }
  }
`

function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const { teams } = useFlags()
  useTermsRedirect()

  return (
    <>
      <NextSeo title={t('Journeys')} />
      <PageWrapper
        title={teams ? <TeamSelect /> : t('Journeys')}
        authUser={AuthUser}
        menu={teams && <TeamMenu />}
        sidePanelChildren={<OnboardingPanelContent />}
        sidePanelTitle={t('Create a New Journey')}
      >
        <JourneyList />
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

  await apolloClient.mutate<UserInviteAcceptAll>({
    mutation: ACCEPT_USER_INVITE
  })

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
})(IndexPage)
