import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { gql, useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { PageWrapper } from '../../src/components/PageWrapper'
import i18nConfig from '../../next-i18next.config'
import { GetPublishedTemplates } from '../../__generated__/GetPublishedTemplates'
import { useJourneys } from '../../src/libs/useJourneys'
import { TemplateLibrary } from '../../src/components/TemplateLibrary'
import { GetUserRole } from '../../__generated__/GetUserRole'
import { Role } from '../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../../src/components/JourneyView/JourneyView'
import { useTermsRedirect } from '../../src/libs/useTermsRedirect/useTermsRedirect'

const GET_PUBLISHED_TEMPLATES = gql`
  query GetPublishedTemplates {
    journeys(where: { template: true }) {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      status
      seoTitle
      seoDescription
      template
      userJourneys {
        id
        role
        openedAt
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
      primaryImageBlock {
        id
        parentBlockId
        parentOrder
        src
        alt
        width
        height
        blurhash
      }
    }
  }
`

function LibraryIndex(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const { data } = useQuery<GetPublishedTemplates>(GET_PUBLISHED_TEMPLATES)
  const journeys = useJourneys()
  const { data: userData } = useQuery<GetUserRole>(GET_USER_ROLE)

  const isPublisher = userData?.getUserRole?.roles?.includes(Role.publisher)

  useTermsRedirect()

  return (
    <>
      <NextSeo title={t('Journey Templates')} />
      <PageWrapper title={t('Journey Templates')} authUser={AuthUser}>
        <TemplateLibrary
          isPublisher={isPublisher}
          journeys={journeys}
          templates={data?.journeys}
        />
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
})(LibraryIndex)
