import { ApolloError, gql } from '@apollo/client'
import type { GetStaticPaths, GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import type {
  GetVideoContent,
  GetVideoContentVariables
} from '../../../__generated__/GetVideoContent'
import type { VideoContentFields } from '../../../__generated__/VideoContentFields'
import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { getFlags } from '../../../src/libs/getFlags'
import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'
import { VIDEO_CONTENT_FIELDS } from '../../../src/libs/videoContentFields'
import { VideoProvider } from '../../../src/libs/videoContext'

const GET_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContent($id: ID!, $languageId: ID) {
    content: video(id: $id, idType: slug) {
      ...VideoContentFields
    }
  }
`

interface EasterPageProps {
  content: VideoContentFields
}

const DynamicVideoContentPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContentPage" */
      '../../../src/components/VideoContentPage'
    )
)

const CollectionPageDynamic = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "CollectionPage" */
      '../../../src/components/CollectionPage'
    )
)

export default function EasterPage({ content }: EasterPageProps): ReactElement {
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <VideoProvider value={{ content }}>
          {/* content.slug = '"easter"' */}
          {content.variant?.hls != null ? (
            <DynamicVideoContentPage />
          ) : (
            <CollectionPageDynamic />
          )}
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
  )
}

export const getStaticProps: GetStaticProps<EasterPageProps> = async (
  context
) => {
  const lang = context.params?.lang?.[0] ?? 'english'
  const contentId = 'easter'

  const client = createApolloClient()
  try {
    const { data } = await client.query<
      GetVideoContent,
      GetVideoContentVariables
    >({
      query: GET_VIDEO_CONTENT,
      variables: {
        id: `${contentId}/${lang}`
      }
    })

    if (data.content == null) {
      return {
        revalidate: 1,
        notFound: true
      }
    }

    return {
      revalidate: 3600,
      props: {
        flags: await getFlags(),
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
