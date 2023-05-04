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
import { gql, useQuery } from '@apollo/client'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { JourneyView } from '../../src/components/JourneyView'
import { GetTemplate } from '../../__generated__/GetTemplate'
import { PageWrapper } from '../../src/components/PageWrapper'
import i18nConfig from '../../next-i18next.config'
import { Menu } from '../../src/components/JourneyView/Menu'
import { useTermsRedirect } from '../../src/libs/useTermsRedirect/useTermsRedirect'

export const GET_TEMPLATE = gql`
  ${JOURNEY_FIELDS}
  query GetTemplate($id: ID!) {
    template: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

function TemplateDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data } = useQuery<GetTemplate>(GET_TEMPLATE, {
    variables: { id: router.query.journeyId }
  })
  useTermsRedirect()

  return (
    <>
      <NextSeo
        title={data?.template?.title ?? t('Journey Template')}
        description={data?.template?.description ?? undefined}
      />
      <JourneyProvider
        value={{ journey: data?.template ?? undefined, admin: true }}
      >
        <PageWrapper
          title={t('Journey Template')}
          authUser={AuthUser}
          showDrawer
          backHref="/templates"
          menu={<Menu />}
        >
          <JourneyView journeyType="Template" />
        </PageWrapper>
      </JourneyProvider>
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
})(TemplateDetails)
