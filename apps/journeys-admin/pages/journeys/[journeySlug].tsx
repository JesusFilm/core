import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import { JourneyProvider, JOURNEY_FIELDS } from '@core/journeys/ui'
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
import { JourneyInvite } from '../../src/components/JourneyInvite/JourneyInvite'
import { GetJourney } from '../../__generated__/GetJourney'
import { JourneyView } from '../../src/components/JourneyView'
import { PageWrapper } from '../../src/components/PageWrapper'
import { Menu } from '../../src/components/JourneyView/Menu'
import i18nConfig from '../../next-i18next.config'

export const GET_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: slug) {
      ...JourneyFields
    }
  }
`

function JourneySlugPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data, error } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeySlug }
  })

  return (
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
            >
              <JourneyView />
            </PageWrapper>
          </JourneyProvider>
        </>
      )}
      {error?.graphQLErrors[0].message ===
        'User has not received an invitation to edit this journey.' && (
        <>
          <NextSeo title={t('Access Denied')} />
          <JourneyInvite journeySlug={router.query.journeySlug as string} />
        </>
      )}
      {error?.graphQLErrors[0].message === 'User invitation pending.' && (
        <>
          <NextSeo title={t('Access Denied')} />
          <JourneyInvite
            journeySlug={router.query.journeySlug as string}
            requestReceived
          />
        </>
      )}
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ locale }) => {
  return {
    props: {
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
})(JourneySlugPage)
