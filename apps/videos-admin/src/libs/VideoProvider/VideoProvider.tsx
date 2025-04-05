import { ReactElement, createContext, useContext } from 'react'

import { GetAdminVideo as AdminVideo } from '../useAdminVideo'

type Video = AdminVideo['adminVideo']

export const VideoContext = createContext<Video | undefined>(undefined)

export function VideoProvider({
  children,
  video
}: {
  children: ReactElement
  video: Video
}): ReactElement {
  return <VideoContext.Provider value={video}>{children}</VideoContext.Provider>
}

export const useVideo = (): Video => {
  const video = useContext(VideoContext)

  if (video === undefined) {
    throw new Error('useVideo must be used within a VideoProvider')
  }

  return video
}
