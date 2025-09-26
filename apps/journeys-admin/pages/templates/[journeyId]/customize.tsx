import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GET_JOURNEY, useJourneyQuery } from '@core/journeys/ui/useJourneyQuery'

import {
  GetJourney,
  GetJourneyVariables
} from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import { MultiStepForm } from '../../../src/components/TemplateCustomization/MultiStepForm'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

function CustomizePage() {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const { data } = useJourneyQuery({
    id: router.query.journeyId as string,
    idType: IdType.databaseId
  })

  return (
    <>
      <NextSeo title={t('Customize Template')} />
      <PageWrapper
        user={user}
        showMainHeader={false}
        mainBodyPadding={false}
        background="linear-gradient(to bottom, #1f2c430f, #2568994d)"
      >
        <JourneyProvider
          value={{
            journey: data?.journey,
            variant: 'customize'
          }}
        >
          <MultiStepForm />
        </JourneyProvider>
      </PageWrapper>
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
  // TODO: remove journeyCustomization check once flag is disabled
  if (journeyId == null || !flags.journeyCustomization) {
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

export default withUser({
  // TODO: remove this after anon user is implemented
  whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN
})(CustomizePage)
