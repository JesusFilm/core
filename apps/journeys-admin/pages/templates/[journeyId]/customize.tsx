import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GET_JOURNEY, useJourneyQuery } from '@core/journeys/ui/useJourneyQuery'

import {
  GetJourney,
  GetJourneyVariables
} from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { MultiStepForm } from '../../../src/components/TemplateCustomization/MultiStepForm'
import { JOURNEY_NOT_FOUND_ERROR } from '../../../src/components/TemplateCustomization/utils/customizationRoutes/customizationRoutes'
import { useAuth } from '../../../src/libs/auth'
import { getAuthTokens, redirectToLogin, toUser } from '../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

function CustomizePage() {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const { data, loading } = useJourneyQuery({
    id: router.query.journeyId as string,
    idType: IdType.databaseId,
    options: {
      skipRoutingFilter: true
    }
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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  const user = tokens != null ? toUser(tokens) : null

  const { apolloClient, flags, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl,
    makeAccountOnAnonymous: true
  })

  const templateCustomizationGuestFlow =
    flags?.templateCustomizationGuestFlow ?? false
  if (user?.id == null && !templateCustomizationGuestFlow) {
    return redirectToLogin(ctx)
  }

  const journeyId = ctx.params?.journeyId
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
        idType: IdType.databaseId,
        options: {
          skipRoutingFilter: true
        }
      }
    })
  } catch (error) {
    if (error.message === 'journey not found') {
      return {
        redirect: {
          destination: `/templates?error=${JOURNEY_NOT_FOUND_ERROR}`,
          permanent: false
        }
      }
    }
    throw error
  }

  return {
    props: {
      userSerialized: user != null ? JSON.stringify(user) : null,
      ...translations,
      flags,
      initialApolloState: apolloClient.cache.extract()
    }
  }
}

export default CustomizePage
