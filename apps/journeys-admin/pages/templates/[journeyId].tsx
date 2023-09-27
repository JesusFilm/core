import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import {
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
import { Menu } from '../../src/components/JourneyView/Menu'
import { PageWrapper } from '../../src/components/PageWrapper'
import { TemplateView } from '../../src/components/TemplateView/TemplateView'
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

  // GetJourney if AuthUser is anon
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
          showDrawer
          backHref="/templates"
          menu={<Menu />}
        >
          {templates ? (
            <TemplateView authUser={AuthUser} />
          ) : (
            <JourneyView journeyType="Template" />
          )}
        </PageWrapper>
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()(
  async ({ AuthUser, locale, req }) => {
    const { flags, redirect, translations } = await initAndAuthApp({
      AuthUser,
      locale
    })

    // Without this we could get a stack of redirect queries (eg redirect to then terms and conditions, then templates)
    const initialRedirect = req.headers.referer?.split('?redirect=').pop()

    if (redirect != null) {
      return initialRedirect != null
        ? {
            redirect: {
              ...redirect,
              destination: redirect.destination + `?redirect=${initialRedirect}`
            }
          }
        : { redirect }
    }

    return {
      props: {
        flags,
        ...translations
      }
    }
  }
)

export default withAuthUser()(TemplateDetails)
