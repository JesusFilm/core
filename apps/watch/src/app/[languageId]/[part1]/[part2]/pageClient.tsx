'use client'

import dynamic from 'next/dynamic'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { GetVideoContent_content } from '../../../../../__generated__/GetVideoContent'
import { LanguageProvider } from '../../../../libs/languageContext/LanguageContext'
import { VideoProvider } from '../../../../libs/videoContext'

const DynamicVideoContentPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContentPage" */
      '../../../../components/VideoContentPage'
    )
)

const DynamicVideoContainerPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContainerPage" */
      '../../../../components/VideoContainerPage'
    )
)

interface Page2PageClientProps {
  content: GetVideoContent_content
  languageId: string
}

export default function page2PageClient({
  content,
  languageId
}: Page2PageClientProps): ReactElement {
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <VideoProvider value={{ content }}>
          {content.variant?.hls != null ? (
            <DynamicVideoContentPage languageId={languageId} />
          ) : (
            <DynamicVideoContainerPage languageId={languageId} />
          )}
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
  )
}
