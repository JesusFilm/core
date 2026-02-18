import { useRouter } from 'next/router'
import absoluteUrl from 'next-absolute-url'
import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { useSnackbar } from 'notistack'
import { useEffect } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GET_JOURNEY, useJourneyQuery } from '@core/journeys/ui/useJourneyQuery'

import {
  GetJourney,
  GetJourneyVariables
} from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { MultiStepForm } from '../../../src/components/TemplateCustomization/MultiStepForm'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

function CustomizePage() {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const user = useUser()
  const { data, loading } = useJourneyQuery({
    id: router.query.journeyId as string,
    idType: IdType.databaseId,
    options: {
      skipRoutingFilter: true
    }
  })

  useEffect(() => {
    if (!router.isReady || loading) return
    const journeyId = router.query.journeyId
    if (journeyId != null && data?.journey == null) {
      enqueueSnackbar(t('Journey not found. Redirected to templates.'), {
        variant: 'error',
        preventDuplicate: true
      })
      router.replace('/templates')
    }
  }, [
    router.isReady,
    router.query.journeyId,
    loading,
    data?.journey,
    router,
    t,
    enqueueSnackbar
  ])

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
  params,
  req
}) => {
  const { apolloClient, flags, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl,
    makeAccountOnAnonymous: true
  })

  const templateCustomizationGuestFlow =
    flags?.templateCustomizationGuestFlow ?? false
  if (user?.id == null && !templateCustomizationGuestFlow) {
    const { origin } = absoluteUrl(req)
    const redirectUrl = new URL(
      resolvedUrl ?? req?.url ?? '/',
      origin
    ).toString()
    return {
      redirect: {
        destination: `/users/sign-in?redirect=${encodeURIComponent(redirectUrl)}`,
        permanent: false
      }
    }
  }

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
