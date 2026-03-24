import { useQuery } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import {
  GetAdminJourney,
  GetAdminJourneyVariables
} from '../../../__generated__/GetAdminJourney'
import {
  GetSSRAdminJourney,
  GetSSRAdminJourneyVariables
} from '../../../__generated__/GetSSRAdminJourney'
import { AccessDenied } from '../../../src/components/AccessDenied'
import { AiEditor } from '../../../src/components/AiEditor'
import { useAuth } from '../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { GET_ADMIN_JOURNEY, GET_SSR_ADMIN_JOURNEY } from '../[journeyId]'

function AiChatPage({ status }): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { user } = useAuth()
  const { data } = useQuery<GetAdminJourney, GetAdminJourneyVariables>(
    GET_ADMIN_JOURNEY,
    {
      variables: { id: router.query.journeyId as string }
    }
  )

  if (status === 'noAccess') {
    return (
      <>
        <NextSeo title={t('Request Access')} />
        <AccessDenied />
      </>
    )
  }

  return (
    <>
      <NextSeo
        title={
          data?.journey?.title != null
            ? t('AI Editor - {{title}}', { title: data.journey.title })
            : t('AI Editor')
        }
        description={data?.journey?.description ?? undefined}
      />
      <AiEditor
        journey={data?.journey ?? undefined}
        user={user ?? undefined}
      />
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const journeyId = Array.isArray(ctx.query?.journeyId)
    ? ctx.query.journeyId[0]
    : ctx.query?.journeyId

  if (journeyId == null) return { notFound: true as const }

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
    const { data } = await apolloClient.query<
      GetSSRAdminJourney,
      GetSSRAdminJourneyVariables
    >({
      query: GET_SSR_ADMIN_JOURNEY,
      variables: {
        id: journeyId
      }
    })

    if (data.journey?.template === true) {
      return {
        redirect: {
          permanent: false,
          destination: `/publisher/${data.journey?.id}`
        }
      }
    }
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

export default AiChatPage
