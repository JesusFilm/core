import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { GetTemplate } from '../../__generated__/GetTemplate'
import { JourneyView } from '../../src/components/JourneyView'
import { PageWrapper } from '../../src/components/NewPageWrapper'
import { TemplateView } from '../../src/components/TemplateView'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect'

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
  const { templates } = useFlags()
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
        value={{
          journey: data?.template ?? undefined,
          variant: 'admin'
        }}
      >
        <PageWrapper
          title={t('Journey Template')}
          authUser={AuthUser}
          backHref="/templates"
        >
          {templates ? (
            <TemplateView />
          ) : (
            <JourneyView journeyType="Template" />
          )}
        </PageWrapper>
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  if (AuthUser == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

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
