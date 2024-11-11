/* eslint-disable i18next/no-literal-string */
import Box from '@mui/material/Box'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'

import 'video.js/dist/video-js.css'

export default function ThreeVideoTest(): ReactElement {
  const initPlayer = (playerRef): void => {
    playerRef.current = videojs(playerRef.current, {
      enableSmoothSeeking: true,
      experimentalSvgIcons: true,
      preload: 'none',
      html5: {
        vhs: {
          limitRenditionByPlayerDimensions: false,
          useNetworkInformationApi: true,
          useDevicePixelRatio: true
        },
        hls: {
          limitRenditionByPlayerDimensions: false,
          useNetworkInformationApi: true,
          useDevicePixelRatio: true
        }
      }
    })
  }
  const brightcovePlayerRef = useRef(null)

  useEffect(() => {
    if (brightcovePlayerRef.current != null) {
      initPlayer(brightcovePlayerRef)
    }
  }, [brightcovePlayerRef])
  return (
    <Box flexGrow={1}>
      <video
        ref={brightcovePlayerRef}
        className="video-js vjs-fluid"
        id="brightcove-player"
        controls
      >
        <source src="https://arc.gt/6ju4l" type="application/x-mpegURL" />
      </video>
    </Box>
  )
}
