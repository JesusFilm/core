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
  const cloudflarePlayerRef = useRef(null)

  useEffect(() => {
    if (cloudflarePlayerRef.current != null) {
      initPlayer(cloudflarePlayerRef)
    }
  }, [cloudflarePlayerRef])
  return (
    <Box flexGrow={1}>
      <video
        className="video-js vjs-fluid"
        id="cloudflare-player"
        ref={cloudflarePlayerRef}
        controls
      >
        <source
          src="https://customer-209o3ptmsiaetvfx.cloudflarestream.com/f50bfef3223fdd83b0005330c46d6fb5/manifest/video.m3u8"
          type="application/x-mpegURL"
        />
      </video>
    </Box>
  )
}
