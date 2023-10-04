import { gql } from '@apollo/client'
import Stack from '@mui/material/Stack'
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

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { AcceptAllInvites } from '../__generated__/AcceptAllInvites'
import {
  GetOnboardingJourneys,
  GetOnboardingJourneys_onboardingJourneys as OnboardingJourneys
} from '../__generated__/GetOnboardingJourneys'
import { JourneyList } from '../src/components/JourneyList'
import { PageWrapper } from '../src/components/NewPageWrapper'
import { OnboardingPanelContent } from '../src/components/OnboardingPanelContent'
import { TeamMenu } from '../src/components/Team/TeamMenu'
import { TeamSelect } from '../src/components/Team/TeamSelect'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'

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

export const GET_ONBOARDING_JOURNEYS = gql`
  query GetOnboardingJourneys($where: JourneysFilter) {
    onboardingJourneys: journeys(where: $where) {
      id
      title
      description
      template
      primaryImageBlock {
        src
      }
    }
  }
`

interface IndexPageProps {
  onboardingJourneys: OnboardingJourneys[]
}

function IndexPage({ onboardingJourneys }: IndexPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const { teams } = useFlags()
  const router = useRouter()

  return (
    <>
      <NextSeo title={t('Journeys')} />
      <PageWrapper
        title={!teams ? t('Journeys') : undefined}
        authUser={AuthUser}
        mainHeaderChildren={
          teams && (
            <Stack
              direction="row"
              flexGrow={1}
              justifyContent="space-between"
              alignItems="center"
            >
              <TeamSelect onboarding={router.query.onboarding === 'true'} />
              <TeamMenu />
            </Stack>
          )
        }
        sidePanelChildren={
          <OnboardingPanelContent onboardingJourneys={onboardingJourneys} />
        }
        sidePanelTitle={t('Create a New Journey')}
      >
        <JourneyList authUser={AuthUser} />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale, resolvedUrl, req, query, params }) => {
  if (AuthUser == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  // Vercel strips the redirect query after redirecting from sign-in
  // Use referer if present to get redirect pathname
  const referer =
    req.headers.host != null && req.headers.referer != null
      ? req.headers.referer?.split('?redirect=')[1]
      : undefined

  console.log(
    'landing page ---',
    req.url,
    query,
    params,
    resolvedUrl,
    req.headers.referer,
    referer
  )

  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
    locale,
    encodedRedirectPathname:
      referer != null
        ? encodeURIComponent(referer)
        : resolvedUrl != null
        ? encodeURIComponent(resolvedUrl)
        : undefined,
    pageSource: 'landing-page'
  })

  if (redirect != null) return { redirect }

  await apolloClient.mutate<AcceptAllInvites>({
    mutation: ACCEPT_ALL_INVITES
  })

  const { data } = await apolloClient.query<GetOnboardingJourneys>({
    query: GET_ONBOARDING_JOURNEYS,
    variables: {
      where: {
        ids: [
          '014c7add-288b-4f84-ac85-ccefef7a07d3',
          'c4889bb1-49ac-41c9-8fdb-0297afb32cd9',
          'e978adb4-e4d8-42ef-89a9-79811f10b7e9',
          '178c01bd-371c-4e73-a9b8-e2bb95215fd8',
          '13317d05-a805-4b3c-b362-9018971d9b57'
        ]
      }
    }
  })

  return {
    props: {
      flags,
      onboardingJourneys: data?.onboardingJourneys,
      ...translations
    }
  }
})

export default withAuthUser<IndexPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(IndexPage)
