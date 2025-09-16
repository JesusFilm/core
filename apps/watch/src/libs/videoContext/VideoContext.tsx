import { ReactElement, ReactNode, createContext, useContext } from 'react'

import type {
  VideoContentFields,
  VideoContentFields_parents
} from '../../../__generated__/VideoContentFields'

export interface VideoPageProps {
  content: VideoContentFields
  container?: VideoContentFields | VideoContentFields_parents
}

interface Context extends Omit<VideoContentFields, '__typename'> {
  container?: VideoContentFields | VideoContentFields_parents
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
  const fallbackContainer =
    value.container ??
    value.content.parents?.find((parent) => parent.variant?.slug != null) ??
    value.content.parents?.[0]

  return (
    <VideoContext.Provider
      value={{ ...value.content, container: fallbackContainer }}
    >
      {children}
    </VideoContext.Provider>
  )
}
