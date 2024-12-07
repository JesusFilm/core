import { createContext, useContext, useState } from 'react'

interface VideoContextType {
  activeVideoId: string | null
  setActiveVideoId: (id: string | null) => void
}

export const VideoContext = createContext<VideoContextType>({
  activeVideoId: null,
  setActiveVideoId: () => {}
})

export const VideoProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  return (
    <VideoContext.Provider value={{ activeVideoId, setActiveVideoId }}>
      {children}
    </VideoContext.Provider>
  )
}

export const useVideo = () => useContext(VideoContext)
