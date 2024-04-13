'use client'

import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import {
  GetVideoContainerAndVideoContent_container,
  GetVideoContainerAndVideoContent_content
} from '../../../../../../__generated__/GetVideoContainerAndVideoContent'
import { VideoContentPage } from '../../../../../components/VideoContentPage'
import { LanguageProvider } from '../../../../../libs/languageContext/LanguageContext'
import { VideoProvider } from '../../../../../libs/videoContext'

interface Page3PageClientProps {
  content: GetVideoContainerAndVideoContent_content
  container: GetVideoContainerAndVideoContent_container
  languageId: string
}
export default function Page3PageClient({
  content,
  container,
  languageId
}: Page3PageClientProps): ReactElement {
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <VideoProvider value={{ content, container }}>
          <VideoContentPage languageId={languageId} />
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
  )
}
