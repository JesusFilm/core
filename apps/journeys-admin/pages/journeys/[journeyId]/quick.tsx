import { useQuery } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetAdminJourney,
  GetAdminJourneyVariables
} from '../../../__generated__/GetAdminJourney'
import { GetCustomDomains } from '../../../__generated__/GetCustomDomains'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { AccessDenied } from '../../../src/components/AccessDenied'
import { JourneyQuickSettings } from '../../../src/components/JourneyQuickSettings'
import { useAuth } from '../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { GET_CUSTOM_DOMAINS } from '../../../src/libs/useCustomDomainsQuery/useCustomDomainsQuery'
import { GET_ADMIN_JOURNEY, USER_JOURNEY_OPEN } from '../[journeyId]'

function JourneyQuickSettingsPage({ status }): ReactElement {
  const { user } = useAuth()
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { data } = useQuery<GetAdminJourney, GetAdminJourneyVariables>(
    GET_ADMIN_JOURNEY,
    {
      variables: { id: router.query.journeyId as string }
    }
  )

  return (
    <>
      <NextSeo
        title={
          status === 'noAccess'
            ? t('Request Access')
            : data?.journey?.title != null
              ? t('{{title}} Express Setup', { title: data.journey.title })
              : t('Journey Express Setup')
        }
        description={data?.journey?.description ?? undefined}
      />
      {status === 'noAccess' ? (
        <AccessDenied />
      ) : (
        <JourneyProvider value={{ journey: data?.journey, variant: 'admin' }}>
          <EditorProvider>
            <JourneyQuickSettings
              displayName={user?.displayName ?? undefined}
            />
          </EditorProvider>
        </JourneyProvider>
      )}
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)

  const user = toUser(tokens)
  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  try {
    const { data } = await apolloClient.query<GetAdminJourney>({
      query: GET_ADMIN_JOURNEY,
      variables: {
        id: ctx.query?.journeyId
      }
    })

    if (data.journey?.team?.id != null) {
      // from: src/components/Editor/Properties/JourneyLink/JourneyLink.tsx
      await apolloClient.query<GetCustomDomains>({
        query: GET_CUSTOM_DOMAINS,
        variables: {
          teamId: data.journey.team.id
        }
      })
    }

    if (data.journey?.template === true) {
      return {
        redirect: {
          permanent: false,
          destination: `/publisher/${data.journey?.id}`
        }
      }
    }
    await apolloClient.mutate<UserJourneyOpen>({
      mutation: USER_JOURNEY_OPEN,
      variables: { id: data.journey?.id }
    })
  } catch (error) {
    if ((error as Error).message === 'journey not found') {
      return {
        redirect: {
          permanent: false,
          destination: '/'
        }
      }
    }
    if ((error as Error).message === 'user is not allowed to view journey') {
      return {
        props: {
          status: 'noAccess',
          userSerialized: JSON.stringify(user),
          ...translations,
          flags,
          initialApolloState: apolloClient.cache.extract()
        }
      }
    }
    throw error
  }

  return {
    props: {
      status: 'success',
      userSerialized: JSON.stringify(user),
      ...translations,
      flags,
      initialApolloState: apolloClient.cache.extract()
    }
  }
}

export default JourneyQuickSettingsPage
