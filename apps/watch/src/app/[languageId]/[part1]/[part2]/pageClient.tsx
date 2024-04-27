'use client'

import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { GetVideoContent_content } from '../../../../../__generated__/GetVideoContent'
import { VideoContainerPage } from '../../../../components/VideoContainerPage'
import { VideoContentPage } from '../../../../components/VideoContentPage'
import { LanguageProvider } from '../../../../libs/languageContext/LanguageContext'
import { VideoProvider } from '../../../../libs/videoContext'

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
            <VideoContentPage languageId={languageId} />
          ) : (
            <VideoContainerPage languageId={languageId} />
          )}
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
  )
}
