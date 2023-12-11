import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useUser, withUser } from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ONBOARDING_IDS } from '../../src/components/OnboardingPanel/OnboardingList/OnboardingList'
import { PageWrapper } from '../../src/components/PageWrapper'
import { TemplateView } from '../../src/components/TemplateView'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import {
  GET_JOURNEY,
  useJourneyQuery
} from '../../src/libs/useJourneyQuery/useJourneyQuery'

function TemplateDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const user = useUser()
  const { data } = useJourneyQuery({
    id: router.query.journeyId as string
  })

  return (
    <>
      <NextSeo
        title={data?.journey?.title ?? t('Journey Template')}
        description={data?.journey?.description ?? undefined}
      />
      <JourneyProvider
        value={{
          journey: data?.journey,
          variant: 'admin'
        }}
      >
        <PageWrapper
          title={t('Journey Template')}
          user={user}
          backHref="/templates"
          backHrefHistory
          mainBodyPadding={false}
        >
          <TemplateView authUser={user} />
        </PageWrapper>
      </JourneyProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const { apolloClient, translations } = await initAndAuthApp({
    locale
  })

  try {
    await apolloClient.query({
      query: GET_JOURNEY,
      variables: {
        id: params?.journeyId
      }
    })
  } catch (error) {
    if (error.message === 'journey not found') {
      return {
        redirect: {
          destination: '/templates',
          permanent: false
        }
      }
    }
    throw error
  }

  return {
    props: {
      ...translations,
      initialApolloState: apolloClient.cache.extract(),
      revalidate: 60
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: ONBOARDING_IDS.map((id) => ({
      params: {
        journeyId: id
      }
    })),
    fallback: 'blocking'
  }
}

export default withUser()(TemplateDetails)
