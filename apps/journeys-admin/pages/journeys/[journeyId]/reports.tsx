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
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { GetJourney } from '../../../__generated__/GetJourney'
import { PageWrapper } from '../../../src/components/NewPageWrapper'
import { GET_JOURNEY, USER_JOURNEY_OPEN } from '../[journeyId]'
import { UserInviteAcceptAll } from '../../../__generated__/UserInviteAcceptAll'
import i18nConfig from '../../../next-i18next.config'
import { MemoizedDynamicReport } from '../../../src/components/DynamicPowerBiReport'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { ACCEPT_USER_INVITE } from '../..'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { ReportsNavigation } from '../../../src/components/ReportsNavigation'
import { checkConditionalRedirect } from '../../../src/libs/checkConditionalRedirect'

function JourneyReportsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const router = useRouter()

  const journeyId = router.query.journeyId as string

  return (
    <>
      <NextSeo title={t('Journey Report')} />
      <PageWrapper
        title={t('Journey Report')}
        authUser={AuthUser}
        backHref={`/journeys/${journeyId}`}
      >
        <Box sx={{ height: 'calc(100vh - 48px)' }}>
          <ReportsNavigation
            reportType={JourneysReportType.singleFull}
            journeyId={journeyId}
            selected="journeys"
          />
          <MemoizedDynamicReport
            reportType={JourneysReportType.singleFull}
            journeyId={journeyId}
          />
        </Box>
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale, query }) => {
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

  await apolloClient.mutate<UserInviteAcceptAll>({
    mutation: ACCEPT_USER_INVITE
  })

  try {
    await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: query?.journeyId
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
})(JourneyReportsPage)
