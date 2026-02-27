import { gql, useQuery } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { Configure, InstantSearch } from 'react-instantsearch'

import { useInstantSearchClient } from '@core/journeys/ui/algolia/InstantSearchProvider'
import { ActiveContent } from '@core/journeys/ui/EditorProvider'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

import {
  GetAdminJourney,
  GetAdminJourneyVariables
} from '../../__generated__/GetAdminJourney'
import {
  GetCustomDomains,
  GetCustomDomainsVariables
} from '../../__generated__/GetCustomDomains'
import {
  GetSSRAdminJourney,
  GetSSRAdminJourneyVariables
} from '../../__generated__/GetSSRAdminJourney'
import {
  UserJourneyOpen,
  UserJourneyOpenVariables
} from '../../__generated__/UserJourneyOpen'
import { AccessDenied } from '../../src/components/AccessDenied'
import { Editor } from '../../src/components/Editor'
import { useAuth } from '../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { GET_CUSTOM_DOMAINS } from '../../src/libs/useCustomDomainsQuery/useCustomDomainsQuery'

export const GET_ADMIN_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetAdminJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

export const GET_SSR_ADMIN_JOURNEY = gql`
  query GetSSRAdminJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      template
      team {
        id
      }
      language {
        id
        bcp47
      }
    }
  }
`

export const USER_JOURNEY_OPEN = gql`
  mutation UserJourneyOpen($id: ID!) {
    userJourneyOpen(id: $id) {
      id
    }
  }
`

function JourneyEditPage({ status }): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { user } = useAuth()
  const { data } = useQuery<GetAdminJourney, GetAdminJourneyVariables>(
    GET_ADMIN_JOURNEY,
    {
      variables: { id: router.query.journeyId as string }
    }
  )

  const searchClient = useInstantSearchClient()

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''}
      stalledSearchDelay={500}
    >
      <Configure
        ruleContexts={['home_page']}
        filters="NOT restrictViewPlatforms:journeys AND published:true AND videoPublished:true AND (label:episode OR label:featureFilm OR label:segment OR label:shortFilm)"
        hitsPerPage={5}
      />
      <NextSeo
        title={
          status === 'noAccess'
            ? t('Request Access')
            : data?.journey?.title != null
              ? t('Edit {{title}}', { title: data.journey.title })
              : t('Edit Journey')
        }
        description={data?.journey?.description ?? undefined}
      />
      {status === 'noAccess' ? (
        <AccessDenied />
      ) : (
        <Editor
          journey={data?.journey ?? undefined}
          selectedStepId={router.query.stepId as string | undefined}
          initialState={{
            activeContent: router.query.view as ActiveContent | undefined
          }}
          user={user ?? undefined}
        />
      )}
    </InstantSearch>
  )
}

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
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
        id: ctx.query?.journeyId as string
      }
    })

    if (data.journey?.team?.id != null) {
      // from: src/components/Editor/Properties/JourneyLink/JourneyLink.tsx
      await apolloClient.query<GetCustomDomains, GetCustomDomainsVariables>({
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
    await apolloClient.mutate<UserJourneyOpen, UserJourneyOpenVariables>({
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

export default JourneyEditPage
