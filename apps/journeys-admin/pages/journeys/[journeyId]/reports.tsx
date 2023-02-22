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
import { useQuery } from '@apollo/client'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { UserInviteAcceptAll } from '../../../__generated__/UserInviteAcceptAll'
import i18nConfig from '../../../next-i18next.config'
import { MemoizedDynamicReport } from '../../../src/components/DynamicPowerBiReport'
import { GetJourney } from '../../../__generated__/GetJourney'
import { GET_JOURNEY } from '../[journeyId]'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { useUserJourneyOpen } from '../../../src/libs/useUserJourneyOpen'
import { ACCEPT_USER_INVITE } from '../..'
import { useTermsRedirect } from '../../../src/libs/useTermsRedirect/useTermsRedirect'

function JourneyReportsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const router = useRouter()

  const journeyId = router.query.journeyId as string
  const { data } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: journeyId }
  })

  useUserJourneyOpen(data?.journey?.id)
  useTermsRedirect()

  return (
    <>
      <NextSeo title={t('Journey Report')} />
      <PageWrapper
        title={t('Journey Report')}
        authUser={AuthUser}
        backHref={`/journeys/${journeyId}`}
        router={router}
      >
        <Box sx={{ height: 'calc(100vh - 48px)' }}>
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
})(JourneyReportsPage)
