import { ReactElement, ReactNode, createContext, useContext } from 'react'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'

export interface VideoPageProps {
  content: VideoContentFields
  container?: VideoContentFields
}

interface Context extends Omit<VideoContentFields, '__typename'> {
  container?: VideoContentFields
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
  return (
    <VideoContext.Provider
      value={{ ...value.content, container: value.container }}
    >
      {children}
    </VideoContext.Provider>
  )
}
