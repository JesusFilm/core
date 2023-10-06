import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { GetPublisher } from '../../__generated__/GetPublisher'
import { Role } from '../../__generated__/globalTypes'
import { JourneyView } from '../../src/components/JourneyView'
import { Menu } from '../../src/components/JourneyView/Menu'
import { PageWrapper } from '../../src/components/PageWrapper'
import { PublisherInvite } from '../../src/components/PublisherInvite'
import { AdminJourneyProvider } from '../../src/libs/AdminJourneyProvider'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useAdminJourneyQuery } from '../../src/libs/useAdminJourneyQuery'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect'

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
  const user = useUser()
  const { data } = useAdminJourneyQuery({
    id: router.query.journeyId as string
  })
  const { data: publisherData } = useQuery<GetPublisher>(GET_PUBLISHER)
  const isPublisher = publisherData?.getUserRole?.roles?.includes(
    Role.publisher
  )

  useInvalidJourneyRedirect(data)
  return (
    <>
      {isPublisher === true && (
        <>
          <NextSeo
            title={data?.journey?.title ?? t('Template Details')}
            description={data?.journey?.description ?? undefined}
          />
          <AdminJourneyProvider
            value={{
              journey: data?.journey ?? undefined
            }}
          >
            <PageWrapper
              title={t('Template Details')}
              user={user}
              showDrawer
              backHref="/publisher"
              menu={<Menu />}
            >
              <JourneyView journeyType="Template" />
            </PageWrapper>
          </AdminJourneyProvider>
        </>
      )}
      {data?.journey != null && isPublisher !== true && (
        <>
          <NextSeo title={t('Access Denied')} />
          <PublisherInvite />
        </>
      )}
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { flags, redirect, translations } = await initAndAuthApp({
    user,
    locale
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      flags,
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TemplateDetailsAdmin)
