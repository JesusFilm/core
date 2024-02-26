import { gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { GetVideoContainerAndVideoContent } from '../../../__generated__/GetVideoContainerAndVideoContent'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import i18nConfig from '../../../next-i18next.config'
import { VideoContentPage } from '../../../src/components/VideoContentPage'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'
import { VIDEO_CONTENT_FIELDS } from '../../../src/libs/videoContentFields'
import { VideoProvider } from '../../../src/libs/videoContext'

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
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <VideoProvider value={{ content, container }}>
          <VideoContentPage />
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
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
  ) {
    return {
      redirect: {
        permanent: false,
        destination: `/${containerId}.html/${contentId}/${languageId}.html`
      }
    }
  }

  const client = createApolloClient()
  const { data } = await client.query<GetVideoContainerAndVideoContent>({
    query: GET_VIDEO_CONTAINER_AND_VIDEO_CONTENT,
    variables: {
      containerId: `${containerId}/${languageId}`,
      contentId: `${contentId}/${languageId}`
    }
  })
  if (data.container == null || data.content == null) {
    return {
      notFound: true
    }
  }
  return {
    revalidate: 3600,
    props: {
      container: data.container,
      content: data.content,
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}
