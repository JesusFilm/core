'use client'
import { gql } from '@apollo/client'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { LanguageProvider } from '../../../libs/languageContext/LanguageContext'
import { VIDEO_CONTENT_FIELDS } from '../../../libs/videoContentFields'
import { VideoProvider } from '../../../libs/videoContext'

export const GET_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContent($id: ID!, $languageId: ID) {
    content: video(id: $id, idType: slug) {
      ...VideoContentFields
    }
  }
`

const DynamicVideoContentPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContentPage" */
      '../../../components/VideoContentPage'
    )
)

const DynamicVideoContainerPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContainerPage" */
      '../../../components/VideoContainerPage'
    )
)

export default async function Page2Page(): Promise<ReactElement> {
  const { data } = await getApolloClient().query<GetVideoContent>({
    query: GET_VIDEO_CONTENT,
    variables: {
      id: `${contentId}/${languageId}`
    }
  })
  if (data.content == null) {
    return notFound()
  }
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <VideoProvider value={{ content }}>
          {content.variant?.hls != null ? (
            <DynamicVideoContentPage />
          ) : (
            <DynamicVideoContainerPage />
          )}
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
  )
}
