'use client'

import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { GetVideoContent_content } from '../../../../../__generated__/GetVideoContent'
import { VideoContainerPage } from '../../../../components/VideoContainerPage'
import { VideoContentPage } from '../../../../components/VideoContentPage'
import { VideoProvider } from '../../../../libs/videoContext'

interface Page2PageClientProps {
  content: GetVideoContent_content
}

export default function page2PageClient({
  content
}: Page2PageClientProps): ReactElement {
  return (
    <SnackbarProvider>
      <VideoProvider value={{ content }}>
        {content.variant?.hls != null ? (
          <VideoContentPage />
        ) : (
          <VideoContainerPage />
        )}
      </VideoProvider>
    </SnackbarProvider>
  )
}
