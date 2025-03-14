import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react'

interface VideoMuteContextType {
  pageMuted: boolean
  setPageMuted: (muted: boolean) => void
}

const VideoMuteContext = createContext<VideoMuteContextType | undefined>(
  undefined
)

interface VideoMuteProviderProps {
  children: ReactNode
  initialMuted?: boolean
}

export function VideoMuteProvider({
  children,
  initialMuted = true
}: VideoMuteProviderProps): JSX.Element {
  const [pageMuted, setPageMuted] = useState(initialMuted)
  const previousMutedState = useRef(initialMuted)

  // Add debugging effect to track pageMuted changes
  useEffect(() => {
    if (pageMuted !== previousMutedState.current) {
      console.debug(
        `[VideoMuteProvider] Mute state changed from ${previousMutedState.current} to ${pageMuted}`
      )
      console.trace('[VideoMuteProvider] Mute state change stack trace:')
      previousMutedState.current = pageMuted
    }
  }, [pageMuted])

  return (
    <VideoMuteContext.Provider value={{ pageMuted, setPageMuted }}>
      {children}
    </VideoMuteContext.Provider>
  )
}

export const useVideoMute = (): VideoMuteContextType => {
  const context = useContext(VideoMuteContext)
  if (context === undefined) {
    throw new Error('useVideoMute must be used within a VideoMuteProvider')
  }
  return context
}
