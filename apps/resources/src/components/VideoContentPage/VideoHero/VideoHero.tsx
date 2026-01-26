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

import { ThemeMode } from '@core/shared/ui/themes'

import { Header } from '../../Header'

import { VideoHeroOverlay } from './VideoHeroOverlay'

/** Spacing in pixels to apply at the bottom of the video hero component. */
const VIDEO_HERO_BOTTOM_SPACING = 150

/**
 * Dynamically imported VideoPlayer component to improve initial load performance.
 * Only loads the video player when needed.
 */
const DynamicVideoPlayer = dynamic<{
  setControlsVisible: Dispatch<SetStateAction<boolean>>
}>(
  async () =>
    await import(
      /* webpackChunkName: "VideoPlayer" */
      './VideoPlayer'
    ).then((mod) => mod.VideoPlayer)
)

/**
 * Props for the VideoHero component.
 * @interface VideoHeroProps
 */
interface VideoHeroProps {
  /** Callback function triggered when the video starts playing. */
  onPlay?: () => void
  /** Flag indicating whether the video has been played before. */
  hasPlayed?: boolean
}

/**
 * VideoHero component for displaying featured video content.
 *
 * Renders a full-viewport video player with overlay controls and handles
 * fullscreen functionality. Integrates with the Header component to adjust
 * visibility based on player state.
 *
 * @param {VideoHeroProps} props - Component props.
 * @returns {ReactElement} Rendered VideoHero component.
 */
export function VideoHero({ onPlay, hasPlayed }: VideoHeroProps): ReactElement {
  /** State tracking whether the video is currently playing. */
  const [isPlaying, setIsPlaying] = useState(false)
  /** State tracking whether the video is in fullscreen mode. */
  const [isFullscreen, setIsFullscreen] = useState(false)
  /** State tracking whether the video controls are visible. */
  const [controlsVisible, setControlsVisible] = useState(true)

  /**
   * Effect to handle fullscreen changes.
   * Adds and removes event listeners for fullscreen state changes.
   */
  useEffect(() => {
    /**
     * Handler for fullscreen change events.
     * Updates component state and scrolls to top when entering fullscreen.
     */
    function fullscreenchange(): void {
      const isFullscreen = fscreen.fullscreenElement != null
      setIsFullscreen(isFullscreen)
      if (isFullscreen) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    fscreen.addEventListener('fullscreenchange', fullscreenchange)

    return () =>
      fscreen.removeEventListener('fullscreenchange', fullscreenchange)
  }, [setIsFullscreen])

  /**
   * Handles play button click.
   * Updates playing state and calls the onPlay callback if provided.
   */
  const handlePlay = useCallback((): void => {
    setIsPlaying(true)
    if (onPlay != null) {
      onPlay()
    }
  }, [onPlay])

  return (
    <>
      <Header
        hideTopAppBar={isFullscreen}
        hideBottomAppBar={!controlsVisible}
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
