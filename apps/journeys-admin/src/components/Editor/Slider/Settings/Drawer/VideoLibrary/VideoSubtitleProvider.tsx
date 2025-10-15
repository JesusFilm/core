import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useState
} from 'react'

export interface SubtitleTrack {
  languageCode: string
  displayName: string
}

export interface VideoSubtitleData {
  tracks: SubtitleTrack[]
  selectedLanguage: string | null
}

interface VideoSubtitleContextValue {
  getSubtitleData: (videoId: string) => VideoSubtitleData | undefined
  setSubtitleTracks: (videoId: string, tracks: SubtitleTrack[]) => void
  setSelectedLanguage: (videoId: string, language: string | null) => void
  clearSubtitleData: (videoId: string) => void
}

const VideoSubtitleContext = createContext<
  VideoSubtitleContextValue | undefined
>(undefined)

interface VideoSubtitleProviderProps {
  children: ReactNode
}

export function VideoSubtitleProvider({
  children
}: VideoSubtitleProviderProps): ReactElement {
  const [subtitleData, setSubtitleData] = useState<
    Record<string, VideoSubtitleData>
  >({})

  const getSubtitleData = (videoId: string): VideoSubtitleData | undefined => {
    return subtitleData[videoId]
  }

  const setSubtitleTracks = (
    videoId: string,
    tracks: SubtitleTrack[]
  ): void => {
    setSubtitleData((prev) => ({
      ...prev,
      [videoId]: {
        tracks,
        selectedLanguage: prev[videoId]?.selectedLanguage ?? null
      }
    }))
  }

  const setSelectedLanguage = (
    videoId: string,
    language: string | null
  ): void => {
    setSubtitleData((prev) => ({
      ...prev,
      [videoId]: {
        tracks: prev[videoId]?.tracks ?? [],
        selectedLanguage: language
      }
    }))
  }

  const clearSubtitleData = (videoId: string): void => {
    setSubtitleData((prev) => {
      const newData = { ...prev }
      delete newData[videoId]
      return newData
    })
  }

  return (
    <VideoSubtitleContext.Provider
      value={{
        getSubtitleData,
        setSubtitleTracks,
        setSelectedLanguage,
        clearSubtitleData
      }}
    >
      {children}
    </VideoSubtitleContext.Provider>
  )
}

export function useVideoSubtitles(
  videoId?: string | null
): VideoSubtitleData | undefined {
  const context = useContext(VideoSubtitleContext)
  if (context === undefined) {
    throw new Error(
      'useVideoSubtitles must be used within a VideoSubtitleProvider'
    )
  }
  if (videoId == null) return undefined
  return context.getSubtitleData(videoId)
}

export function useVideoSubtitleActions(): Omit<
  VideoSubtitleContextValue,
  'getSubtitleData'
> {
  const context = useContext(VideoSubtitleContext)
  if (context === undefined) {
    throw new Error(
      'useVideoSubtitleActions must be used within a VideoSubtitleProvider'
    )
  }
  return {
    setSubtitleTracks: context.setSubtitleTracks,
    setSelectedLanguage: context.setSelectedLanguage,
    clearSubtitleData: context.clearSubtitleData
  }
}
