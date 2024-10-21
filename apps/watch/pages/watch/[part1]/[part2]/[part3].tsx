import { ApolloError, gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'
import { InstantSearch } from 'react-instantsearch'

import { useInstantSearchClient } from '@core/journeys/ui/algolia/InstantSearchProvider'

import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import i18nConfig from '../../../../next-i18next.config'
import { VideoContentPage } from '../../../../src/components/VideoContentPage'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import { getFlags } from '../../../../src/libs/getFlags'
import { LanguageProvider } from '../../../../src/libs/languageContext/LanguageContext'
import { slugMap } from '../../../../src/libs/slugMap'
import { VIDEO_CONTENT_FIELDS } from '../../../../src/libs/videoContentFields'
import { VideoProvider } from '../../../../src/libs/videoContext'
import {
  GetVideoContainerPart2,
  GetVideoContainerPart2Variables
} from '../../../../__generated__/GetVideoContainerPart2'
import {
  GetVideoContentPart3,
  GetVideoContentPart3Variables
} from '../../../../__generated__/GetVideoContentPart3'

export const GET_VIDEO_CONTAINER_PART_2 = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContainerPart2($containerId: ID!, $languageId: ID) {
    container: video(id: $containerId, idType: slug) {
      ...VideoContentFields
    }
  }
`

export const GET_VIDEO_CONTENT_PART_3 = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContentPart3($contentId: ID!, $languageId: ID) {
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
    const [{ data: containerData }, { data: contentData }] = await Promise.all([
      client.query<GetVideoContainerPart2, GetVideoContainerPart2Variables>({
        query: GET_VIDEO_CONTAINER_PART_2,
        variables: {
          containerId: `${containerId}/${languageId}`
        }
      }),
      client.query<GetVideoContentPart3, GetVideoContentPart3Variables>({
        query: GET_VIDEO_CONTENT_PART_3,
        variables: {
          contentId: `${contentId}/${languageId}`
        }
      })
    ])
    if (containerData.container == null || contentData.content == null) {
      return {
        revalidate: 1,
        notFound: true
      }
    }
    return {
      revalidate: 3600,
      props: {
        flags: await getFlags(),
        container: containerData.container,
        content: contentData.content,
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
        ({ extensions, message }) =>
          extensions?.code === 'NOT_FOUND' ||
          message?.startsWith('Video not found')
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
