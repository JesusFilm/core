import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { gql, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { PageWrapper } from '../../src/components/PageWrapper'
import { GetPublisherTemplate } from '../../__generated__/GetPublisherTemplate'
import { GetPublisher } from '../../__generated__/GetPublisher'
import i18nConfig from '../../next-i18next.config'
import { JourneyView } from '../../src/components/JourneyView'
import { Role } from '../../__generated__/globalTypes'
import { PublisherInvite } from '../../src/components/PublisherInvite'
import { Menu } from '../../src/components/JourneyView/Menu'
import { useTermsRedirect } from '../../src/libs/useTermsRedirect/useTermsRedirect'

export const GET_PUBLISHER_TEMPLATE = gql`
  ${JOURNEY_FIELDS}
  query GetPublisherTemplate($id: ID!) {
    publisherTemplate: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

export const GET_PUBLISHER = gql`
  query GetPublisher {
    getUserRole {
      id
      roles
    }
  }
`

function TemplateDetailsAdmin(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data } = useQuery<GetPublisherTemplate>(GET_PUBLISHER_TEMPLATE, {
    variables: { id: router.query.journeyId }
  })
  const { data: publisherData } = useQuery<GetPublisher>(GET_PUBLISHER)
  const isPublisher = publisherData?.getUserRole?.roles?.includes(
    Role.publisher
  )

  useTermsRedirect()

  return (
    <>
      {isPublisher === true && (
        <>
          <NextSeo
            title={data?.publisherTemplate?.title ?? t('Template Details')}
            description={data?.publisherTemplate?.description ?? undefined}
          />
          <JourneyProvider
            value={{
              journey: data?.publisherTemplate ?? undefined,
              admin: true
            }}
          >
            <PageWrapper
              title={t('Template Details')}
              authUser={AuthUser}
              showDrawer
              backHref="/publisher"
              menu={<Menu />}
              router={router}
            >
              <JourneyView journeyType="Template" />
            </PageWrapper>
          </JourneyProvider>
        </>
      )}
      {isPublisher !== true && (
        <>
          <NextSeo title={t('Access Denied')} />
          <PublisherInvite />
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
})(TemplateDetailsAdmin)
