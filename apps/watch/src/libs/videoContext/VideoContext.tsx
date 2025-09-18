import { ReactElement, ReactNode, createContext, useContext } from 'react'

import type {
  VideoContentFields,
  VideoContentFields_parents
} from '../../../__generated__/VideoContentFields'

export interface VideoPageProps {
  content: VideoContentFields | null
  container?: VideoContentFields | VideoContentFields_parents
}

interface Context extends Omit<VideoContentFields, '__typename'> {
  container?: VideoContentFields | VideoContentFields_parents
}

function isVideoContentFields(
  value?: VideoContentFields | VideoContentFields_parents
): value is VideoContentFields {
  return value != null && 'variantLanguagesCount' in value
}

const VideoContext = createContext<Context | undefined>(undefined)

export function useVideo(): Context {
  const context = useContext(VideoContext)

  if (context === undefined) {
    throw new Error('useVideos must be used within a VideoProvider')
  }

  return context
}

interface VideoProviderProps {
  children: ReactNode
  value: VideoPageProps
}

export function VideoProvider({
  children,
  value
}: VideoProviderProps): ReactElement {
  const content =
    value.content ??
    (isVideoContentFields(value.container) ? value.container : undefined)

  if (content == null) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('VideoProvider missing video content', value)
    }
    return <></>
  }

  const fallbackContainer =
    value.container ??
    content.parents?.find((parent) => parent.variant?.slug != null) ??
    content.parents?.[0]

  return (
    <VideoContext.Provider
      value={{ ...content, container: fallbackContainer }}
    >
      {children}
    </VideoContext.Provider>
  )
}
