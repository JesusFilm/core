import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
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
import { TemplateList } from '../../src/components/TemplateList'
import { GetPublicTemplates } from '../../__generated__/GetPublicTemplates'

const GET_PUBLIC_TEMPLATES = gql`
  query GetPublicTemplates {
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

function TemplateIndex(): ReactElement {
  const AuthUser = useAuthUser()
  const { data } = useQuery<GetPublicTemplates>(GET_PUBLIC_TEMPLATES)

  return (
    <>
      <NextSeo title={'Journey Templates'} />
      <PageWrapper title={'Journey Templates'} authUser={AuthUser}>
        <TemplateList templates={data?.journeys} />
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
})(TemplateIndex)
