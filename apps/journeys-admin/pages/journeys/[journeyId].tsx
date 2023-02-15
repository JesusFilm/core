import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useRouter } from 'next/router'
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
import { JourneyInvite } from '../../src/components/JourneyInvite/JourneyInvite'
import { GetJourney } from '../../__generated__/GetJourney'
import { JourneyView } from '../../src/components/JourneyView'
import { PageWrapper } from '../../src/components/PageWrapper'
import { Menu } from '../../src/components/JourneyView/Menu'
import i18nConfig from '../../next-i18next.config'
import { useUserJourneyOpen } from '../../src/libs/useUserJourneyOpen'
import { useTermsRedirect } from '../../src/libs/useTermsRedirect/useTermsRedirect'

export const GET_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

function JourneyIdPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data, error } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeyId }
  })

  const termsAccepted = useTermsRedirect()

  useUserJourneyOpen(
    AuthUser.id,
    data?.journey?.id,
    data?.journey?.userJourneys
  )

  return (
    <>
      {termsAccepted && (
        <>
          {error == null && (
            <>
              <NextSeo
                title={data?.journey?.title ?? t('Journey')}
                description={data?.journey?.description ?? undefined}
              />
              <JourneyProvider
                value={{ journey: data?.journey ?? undefined, admin: true }}
              >
                <PageWrapper
                  title={t('Journey Details')}
                  showDrawer
                  backHref="/"
                  menu={<Menu />}
                  authUser={AuthUser}
                  router={router}
                >
                  <JourneyView journeyType="Journey" />
                </PageWrapper>
              </JourneyProvider>
            </>
          )}
          {error?.graphQLErrors[0].message ===
            'User has not received an invitation to edit this journey.' && (
            <>
              <NextSeo title={t('Access Denied')} />
              <JourneyInvite journeyId={router.query.journeyId as string} />
            </>
          )}
          {error?.graphQLErrors[0].message === 'User invitation pending.' && (
            <>
              <NextSeo title={t('Access Denied')} />
              <JourneyInvite
                journeyId={router.query.journeyId as string}
                requestReceived
              />
            </>
          )}
        </>
      )}
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
})(JourneyIdPage)
