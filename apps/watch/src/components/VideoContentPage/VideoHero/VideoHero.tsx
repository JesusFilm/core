import Box from '@mui/material/Box'
import fscreen from 'fscreen'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import Div100vh from 'react-div-100vh'

import { Header } from '../../Header'

import { VideoHeroOverlay } from './VideoHeroOverlay'
import { VideoPlayer } from './VideoPlayer'

const VIDEO_HERO_BOTTOM_SPACING = 150

interface VideoHeroProps {
  languageId: string
  onPlay?: () => void
  hasPlayed?: boolean
}

export function VideoHero({
  onPlay,
  hasPlayed,
  languageId
}: VideoHeroProps): ReactElement {
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
      <Header hideAbsoluteAppBar={!controlsVisible} languageId={languageId} />
      <Div100vh
        style={{
          marginBottom: isFullscreen ? 0 : -VIDEO_HERO_BOTTOM_SPACING,
          paddingBottom: isFullscreen ? 0 : VIDEO_HERO_BOTTOM_SPACING,
          minHeight: 560
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
            <VideoPlayer
              languageId={languageId}
              setControlsVisible={setControlsVisible}
            />
          ) : (
            !isPlaying && (
              <VideoHeroOverlay
                languageId={languageId}
                handlePlay={handlePlay}
              />
            )
          )}
        </Box>
      </Div100vh>
    </>
  )
}
