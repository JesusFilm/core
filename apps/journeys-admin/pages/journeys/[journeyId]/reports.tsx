import { gql, useQuery } from '@apollo/client'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useCallback, useRef } from 'react'

import {
  GetAdminJourneyWithPlausibleToken,
  GetAdminJourneyWithPlausibleTokenVariables
} from '../../../__generated__/GetAdminJourneyWithPlausibleToken'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { ReportsNavigation } from '../../../src/components/ReportsNavigation'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { USER_JOURNEY_OPEN } from '../[journeyId]'

export const GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN = gql`
  query GetAdminJourneyWithPlausibleToken($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      plausibleToken
    }
  }
`

const StyledIFrame = styled('iframe')({
  border: 0
})

function useHookWithRefCallback(): (node: HTMLIFrameElement | null) => void {
  const ref = useRef<HTMLIFrameElement | null>(null)
  const setRef = useCallback((node: HTMLIFrameElement | null) => {
    if (ref.current != null) {
      // Make sure to cleanup any events/references added to the last instance
    }

    if (node != null) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
      node.addEventListener('load', () => {
        const cssLink = document.createElement('link')
        cssLink.href = '/plausible.css'
        cssLink.rel = 'stylesheet'
        cssLink.type = 'text/css'
        node.contentWindow?.document.head.appendChild(cssLink)
      })
    }

    // Save a reference to the node
    ref.current = node
  }, [])

  return setRef
}

function JourneyReportsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()

  const { data, loading } = useQuery<
    GetAdminJourneyWithPlausibleToken,
    GetAdminJourneyWithPlausibleTokenVariables
  >(GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN, {
    variables: { id: router.query.journeyId as string }
  })
  const journeyId = router.query.journeyId as string
  const ref = useHookWithRefCallback()

  return (
    <>
      <NextSeo title={t('Journey Analytics')} />
      <PageWrapper
        title={t('Journey Analytics')}
        user={user}
        backHref={`/journeys/${journeyId}`}
        mainBodyPadding={false}
        mainHeaderChildren={<ReportsNavigation journeyId={journeyId} />}
      >
        {loading && <p>{t('Loading')}...</p>}
        {!loading && data?.journey.plausibleToken != null && (
          <>
            <StyledIFrame
              plausible-embed
              src={`/share/api-journeys-journey-${journeyId}?auth=${data?.journey.plausibleToken}&embed=true&theme=light&background=transparent`}
              loading="lazy"
              ref={ref}
              sx={{
                height: { xs: 'calc(100vh - 96px)', md: 'calc(100vh - 48px)' }
              }}
            />
            <script async src="/js/embed.host.js" />
          </>
        )}
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, query, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  try {
    await apolloClient.query<
      GetAdminJourneyWithPlausibleToken,
      GetAdminJourneyWithPlausibleTokenVariables
    >({
      query: GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN,
      variables: {
        id: query?.journeyId as string
      }
    })
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: `/journeys/${query?.journeyId as string}`
      }
    }
  }

  await apolloClient.mutate<UserJourneyOpen>({
    mutation: USER_JOURNEY_OPEN,
    variables: { id: query?.journeyId }
  })

  return {
    props: {
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyReportsPage)
