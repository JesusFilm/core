import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { gql, useQuery } from '@apollo/client'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { JourneyView } from '../../src/components/JourneyView'
import { GetTemplate } from '../../__generated__/GetTemplate'
import { PageWrapper } from '../../src/components/PageWrapper'
import { Menu } from '../../src/components/JourneyView/Menu'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

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
  useInvalidJourneyRedirect(data)

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
  const { flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
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

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TemplateDetails)
