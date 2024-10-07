import { ApolloError, gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'
import { InstantSearch } from 'react-instantsearch'

import { useInstantSearchClient } from '@core/journeys/ui/algolia/InstantSearchProvider'

import { GetVideoContainerAndVideoContent } from '../../../../__generated__/GetVideoContainerAndVideoContent'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import i18nConfig from '../../../../next-i18next.config'
import { VideoContentPage } from '../../../../src/components/VideoContentPage'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import { getFlags } from '../../../../src/libs/getFlags'
import { LanguageProvider } from '../../../../src/libs/languageContext/LanguageContext'
import { slugMap } from '../../../../src/libs/slugMap'
import { VIDEO_CONTENT_FIELDS } from '../../../../src/libs/videoContentFields'
import { VideoProvider } from '../../../../src/libs/videoContext'

export const GET_VIDEO_CONTAINER_AND_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContainerAndVideoContent(
    $containerId: ID!
    $contentId: ID!
    $languageId: ID
  ) {
    container: video(id: $containerId, idType: slug) {
      ...VideoContentFields
    }
    content: video(id: $contentId, idType: slug) {
      ...VideoContentFields
    }
  }
`

interface Part3PageProps {
  container: VideoContentFields
  content: VideoContentFields
}

export default function Part3Page({
  container,
  content
}: Part3PageProps): ReactElement {
  const searchClient = useInstantSearchClient()
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <InstantSearch searchClient={searchClient} indexName={indexName} insights>
      <SnackbarProvider>
        <LanguageProvider>
          <VideoProvider value={{ content, container }}>
            <VideoContentPage />
          </VideoProvider>
        </LanguageProvider>
      </SnackbarProvider>
    </InstantSearch>
  )
}

export const getStaticProps: GetStaticProps<Part3PageProps> = async (
  context
) => {
  const [containerId, containerIdExtension] = (
    context.params?.part1 as string
  ).split('.')
  const [contentId, contentIdExtension] = (
    context.params?.part2 as string
  ).split('.')
  const [languageId, languageIdExtension] = (
    context.params?.part3 as string
  ).split('.')

  if (
    containerIdExtension !== 'html' ||
    contentIdExtension !== undefined ||
    languageIdExtension !== 'html'
  )
    return {
      redirect: {
        permanent: false,
        destination: `/watch/${containerId}.html/${encodeURIComponent(
          contentId
        )}/${languageId}.html`
      }
    }

  if (slugMap[languageId] != null)
    return {
      redirect: {
        permanent: false,
        destination: `/watch/${containerId}.html/${encodeURIComponent(
          contentId
        )}/${slugMap[languageId]}.html`
      }
    }

  const client = createApolloClient()
  try {
    const { data } = await client.query<GetVideoContainerAndVideoContent>({
      query: GET_VIDEO_CONTAINER_AND_VIDEO_CONTENT,
      variables: {
        containerId: `${containerId}/${languageId}`,
        contentId: `${contentId}/${languageId}`
      }
    })
    if (data.container == null || data.content == null) {
      return {
        revalidate: 1,
        notFound: true
      }
    }
    return {
      revalidate: 3600,
      props: {
        flags: await getFlags(),
        container: data.container,
        content: data.content,
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-watch'],
          i18nConfig
        ))
      }
    }
  } catch (error) {
    if (
      error instanceof ApolloError &&
      error.graphQLErrors.some(
        ({ extensions }) => extensions?.code === 'NOT_FOUND'
      )
    )
      return {
        revalidate: 1,
        notFound: true
      }
    throw error
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}
