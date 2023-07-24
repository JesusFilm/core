import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { useTranslation } from 'react-i18next'
import { gql } from '@apollo/client'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { JourneyList } from '../src/components/JourneyList'
import { PageWrapper } from '../src/components/NewPageWrapper'
import { OnboardingPanelContent } from '../src/components/OnboardingPanelContent'
import { TeamSelect } from '../src/components/Team/TeamSelect'
import { TeamMenu } from '../src/components/Team/TeamMenu'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'
import { AcceptAllInvites } from '../__generated__/AcceptAllInvites'

export const ACCEPT_ALL_INVITES = gql`
  mutation AcceptAllInvites {
    userTeamInviteAcceptAll {
      id
    }
    userInviteAcceptAll {
      id
    }
  }
`

function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const { teams } = useFlags()

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
        <JourneyList authUser={AuthUser} />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
    locale
  })

  if (redirect != null) return { redirect }

  await apolloClient.mutate<AcceptAllInvites>({
    mutation: ACCEPT_ALL_INVITES
  })

  return {
    props: {
      flags,
      ...translations
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(IndexPage)
