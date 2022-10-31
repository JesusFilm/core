import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { gql, useQuery } from '@apollo/client'
import { VisitorDetail } from '../../../src/components/VisitorDetail'
import { PageWrapper } from '../../../src/components/PageWrapper'
import i18nConfig from '../../../next-i18next.config'
import { GetVisitor } from '../../../__generated__/GetVisitor'

const GET_VISITOR = gql`
  query GetVisitor($id: ID!) {
    visitor(id: $id) {
      countryCode
      email
      id
      lastChatStartedAt
      messengerId
      messengerNetwork
      name
      notes
      status
      userAgent {
        browser {
          name
          version
        }
        device {
          model
          type
          vendor
        }
        os {
          name
          version
        }
      }
    }
  }
`

function SingleVisitorReportsPage(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const { data, loading } = useQuery<GetVisitor>(GET_VISITOR, {
    variables: { id: router.query.visitorId }
  })

  return (
    <>
      <NextSeo title={t('Visitor Info')} />
      <PageWrapper
        title={t('Visitor Info')}
        authUser={AuthUser}
        router={router}
      >
        {data?.visitor != null && (
          <VisitorDetail visitor={data.visitor} loading={loading} />
        )}
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
})(SingleVisitorReportsPage)
