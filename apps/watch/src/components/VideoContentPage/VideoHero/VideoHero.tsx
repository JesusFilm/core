import Box from '@mui/material/Box'
import fscreen from 'fscreen'
import dynamic from 'next/dynamic'
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from 'react'
import Div100vh from 'react-div-100vh'

import { ThemeMode } from '@core/shared/ui/themes'

import { Header } from '../../Header'

import { VideoHeroOverlay } from './VideoHeroOverlay'

const VIDEO_HERO_BOTTOM_SPACING = 150

const DynamicVideoPlayer = dynamic<{
  setControlsVisible: Dispatch<SetStateAction<boolean>>
}>(
  async () =>
    await import(
      /* webpackChunkName: "VideoPlayer" */
      './VideoPlayer'
    ).then((mod) => mod.VideoPlayer)
)

interface VideoHeroProps {
  onPlay?: () => void
  hasPlayed?: boolean
}

export function VideoHero({ onPlay, hasPlayed }: VideoHeroProps): ReactElement {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)

  useEffect(() => {
    function fullscreenchange(): void {
      setIsFullscreen(fscreen.fullscreenElement != null)
    }

    fscreen.addEventListener('fullscreenchange', fullscreenchange)

    return () =>
      fscreen.removeEventListener('fullscreenchange', fullscreenchange)
  }, [setIsFullscreen])

  const handlePlay = useCallback((): void => {
    setIsPlaying(true)
    if (onPlay != null) {
      onPlay()
    }
  }, [onPlay])

  return (
    <>
      <Header
        hideAbsoluteAppBar={!controlsVisible}
        hideSpacer
        themeMode={ThemeMode.dark}
      />
      <Box
        css={{
          height: '100svh',
          marginBottom: isFullscreen ? 0 : -VIDEO_HERO_BOTTOM_SPACING,
          paddingBottom: isFullscreen ? 0 : VIDEO_HERO_BOTTOM_SPACING
        }}
      >
        <Box
          sx={{
            background: 'black',
            position: 'relative',
            height: '100%',
            width: '100%',
            '.vjs-hidden': { display: 'none' },
            '.vjs-loading-spinner, .vjs-seeking .vjs-loading-spinner, .vjs-waiting .vjs-loading-spinner':
              { display: 'none' },
            '.vjs, .vjs-tech': {
              height: '100%',
              width: '100%'
            }
          }}
          data-testid="VideoHero"
        >
          {hasPlayed === true ? (
            <DynamicVideoPlayer setControlsVisible={setControlsVisible} />
          ) : (
            !isPlaying && <VideoHeroOverlay handlePlay={handlePlay} />
          )}
        </Box>
      </Box>
    </>
  )
}
