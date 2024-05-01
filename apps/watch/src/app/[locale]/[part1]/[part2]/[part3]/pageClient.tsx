'use client'

import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import {
  GetVideoContainerAndVideoContent_container,
  GetVideoContainerAndVideoContent_content
} from '../../../../../../__generated__/GetVideoContainerAndVideoContent'
import { VideoContentPage } from '../../../../../components/VideoContentPage'
import { VideoProvider } from '../../../../../libs/videoContext'

interface Page3PageClientProps {
  content: GetVideoContainerAndVideoContent_content
  container: GetVideoContainerAndVideoContent_container
}
export default function Page3PageClient({
  content,
  container
}: Page3PageClientProps): ReactElement {
  return (
    <SnackbarProvider>
      <VideoProvider value={{ content, container }}>
        <VideoContentPage />
      </VideoProvider>
    </SnackbarProvider>
  )
}
