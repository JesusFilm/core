import { gql, useQuery } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { Configure, InstantSearch } from 'react-instantsearch'

import { useInstantSearchClient } from '@core/journeys/ui/algolia/InstantSearchProvider'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

import { GetPublisher } from '../../__generated__/GetPublisher'
import { GetPublisherTemplate } from '../../__generated__/GetPublisherTemplate'
import { Role } from '../../__generated__/globalTypes'
import { Editor } from '../../src/components/Editor'
import { PublisherInvite } from '../../src/components/PublisherInvite'
import { getAuthTokens, redirectToLogin, toUser } from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect'

export const GET_PUBLISHER_TEMPLATE = gql`
  ${JOURNEY_FIELDS}
  query GetPublisherTemplate($id: ID!) {
    publisherTemplate: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

export const GET_PUBLISHER = gql`
  query GetPublisher {
    getUserRole {
      id
      roles
    }
  }
`

function TemplateEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { data } = useQuery<GetPublisherTemplate>(GET_PUBLISHER_TEMPLATE, {
    variables: { id: router.query.journeyId }
  })
  const { data: publisherData } = useQuery<GetPublisher>(GET_PUBLISHER)
  const isPublisher = publisherData?.getUserRole?.roles?.includes(
    Role.publisher
  )
  const isGlobalTemplate = data?.publisherTemplate?.team?.id === 'jfp-team'

  const searchClient = useInstantSearchClient()

  useInvalidJourneyRedirect(data)

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''}
      stalledSearchDelay={500}
    >
      <Configure
        ruleContexts={['home_page']}
        filters="label:episode OR label:featureFilm OR label:segment OR label:shortFilm"
        hitsPerPage={5}
      />
      {(isPublisher || !isGlobalTemplate) && (
        <>
          <NextSeo
            title={
              data?.publisherTemplate?.title != null
                ? t('Edit {{title}}', { title: data.publisherTemplate.title })
                : t('Edit Journey')
            }
            description={data?.publisherTemplate?.description ?? undefined}
          />
          <Editor
            journey={data?.publisherTemplate ?? undefined}
            selectedStepId={router.query.stepId as string | undefined}
          />
        </>
      )}
      {isGlobalTemplate && !isPublisher && (
        <>
          <NextSeo title={t('Access Denied')} />
          <PublisherInvite />
        </>
      )}
    </InstantSearch>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  const user = tokens != null ? toUser(tokens) : null

  if (user == null) return redirectToLogin(ctx)

  const { redirect, translations, flags } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      ...translations,
      flags
    }
  }
}

export default TemplateEditPage
