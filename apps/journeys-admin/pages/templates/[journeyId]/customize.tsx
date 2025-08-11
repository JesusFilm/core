import { useRouter } from 'next/router'
import { withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'

import { GET_JOURNEY, useJourneyQuery } from '@core/journeys/ui/useJourneyQuery'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney,
  GetJourneyVariables
} from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import { MultiStepForm } from '../../../src/components/TemplateCustomization/MultiStepForm'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

function CustomizePage() {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useJourneyQuery({
    id: router.query.journeyId as string,
    idType: IdType.databaseId
  })

  return (
    <>
      <NextSeo title={t('Customize Template')} />
      <JourneyProvider
        value={{
          journey: data?.journey,
          variant: 'admin'
        }}
      >
        <MultiStepForm />
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR()(async ({
  user,
  locale,
  resolvedUrl,
  params
}) => {
  const { apolloClient, flags, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl,
    makeAccountOnAnonymous: true
  })

  const journeyId = params?.journeyId
  if (journeyId == null) {
    return {
      redirect: {
        destination: '/templates',
        permanent: false
      }
    }
  }

  try {
    await apolloClient.query<GetJourney, GetJourneyVariables>({
      query: GET_JOURNEY,
      variables: {
        id: journeyId.toString(),
        idType: IdType.databaseId
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
      flags,
      initialApolloState: apolloClient.cache.extract()
    }
  }
})

export default withUser()(CustomizePage)
