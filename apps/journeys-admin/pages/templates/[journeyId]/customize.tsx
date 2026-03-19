import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { Component, ErrorInfo, ReactElement, ReactNode, useEffect } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GET_JOURNEY, useJourneyQuery } from '@core/journeys/ui/useJourneyQuery'

import {
  GetJourney,
  GetJourneyVariables
} from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { MultiStepForm } from '../../../src/components/TemplateCustomization/MultiStepForm'
import {
  JOURNEY_NOT_FOUND_ERROR,
  SERVER_ERROR
} from '../../../src/components/TemplateCustomization/utils/customizationRoutes/customizationRoutes'
import { useAuth } from '../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

interface DiagnosticBoundaryState {
  hasError: boolean
}

class DiagnosticErrorBoundary extends Component<
  { children: ReactNode },
  DiagnosticBoundaryState
> {
  state: DiagnosticBoundaryState = { hasError: false }

  static getDerivedStateFromError(): DiagnosticBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[NES-1460-diag] client-side render crash in customize', {
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack?.split('\n').slice(0, 5).join('\n'),
      componentStack: info.componentStack?.split('\n').slice(0, 8).join('\n')
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <DiagnosticFallback />
    }
    return this.props.children
  }
}

function DiagnosticFallback(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box
      role="alert"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2,
        p: 4
      }}
    >
      <Typography variant="h5">{t('Something went wrong')}</Typography>
      <Typography variant="body1" color="text.secondary">
        {t(
          'Please try refreshing the page. If the problem persists, contact support.'
        )}
      </Typography>
    </Box>
  )
}

function CustomizePage() {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const { data, loading, error } = useJourneyQuery({
    id: router.query.journeyId as string,
    idType: IdType.databaseId,
    options: {
      skipRoutingFilter: true
    }
  })

  useEffect(() => {
    if (error == null) return
    console.error('[NES-1460-diag] client-side useJourneyQuery error', {
      journeyId: router.query.journeyId,
      errorMessage: error.message,
      networkError:
        error.networkError != null
          ? {
              name: error.networkError.name,
              message: error.networkError.message
            }
          : undefined,
      graphQLErrors: error.graphQLErrors?.map((e) => e.message)
    })
  }, [error, router.query.journeyId])

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
          <DiagnosticErrorBoundary key={router.query.journeyId as string}>
            <MultiStepForm />
          </DiagnosticErrorBoundary>
        </JourneyProvider>
      </PageWrapper>
    </>
  )
}

function logDiagnosticError(
  phase: string,
  error: unknown,
  ctx: GetServerSidePropsContext,
  extra?: Record<string, unknown>
): void {
  console.error('[NES-1460-diag] customize getServerSideProps failed', {
    phase,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorName: error instanceof Error ? error.name : undefined,
    url: ctx.resolvedUrl,
    ...extra
  })
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  let tokens: Awaited<ReturnType<typeof getAuthTokens>>
  try {
    tokens = await getAuthTokens(ctx)
  } catch (error) {
    logDiagnosticError('getAuthTokens', error, ctx)
    throw error
  }

  const user = tokens != null ? toUser(tokens) : null

  let initResult: Awaited<ReturnType<typeof initAndAuthApp>>
  try {
    initResult = await initAndAuthApp({
      user,
      locale: ctx.locale,
      resolvedUrl: ctx.resolvedUrl,
      makeAccountOnAnonymous: true
    })
  } catch (error) {
    logDiagnosticError('initAndAuthApp', error, ctx)
    throw error
  }

  const { apolloClient, flags, translations } = initResult

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
    logDiagnosticError('journeyQuery', error, ctx, {
      journeyId: journeyId?.toString(),
      hasUser: user != null,
      isAnonymous: user?.isAnonymous
    })
    return {
      redirect: {
        destination: `/templates?error=${SERVER_ERROR}`,
        permanent: false
      }
    }
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
