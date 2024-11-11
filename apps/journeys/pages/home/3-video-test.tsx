/* eslint-disable i18next/no-literal-string */
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
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
  const cloudflarePlayerRef = useRef(null)
  const muxPlayerRef = useRef(null)

  useEffect(() => {
    if (brightcovePlayerRef.current != null) {
      initPlayer(brightcovePlayerRef)
    }
    if (cloudflarePlayerRef.current != null) {
      initPlayer(cloudflarePlayerRef)
    }
    if (muxPlayerRef.current != null) {
      initPlayer(muxPlayerRef)
    }
  }, [brightcovePlayerRef, cloudflarePlayerRef, muxPlayerRef])
  return (
    <Box flexGrow={1}>
      <Grid container spacing={1} flexGrow={1}>
        <Grid size={6}>
          <div>Brightcove</div>
          <video
            ref={brightcovePlayerRef}
            className="video-js vjs-fluid"
            id="brightcove-player"
            controls
          >
            <source src="https://arc.gt/6ju4l" type="application/x-mpegURL" />
          </video>
        </Grid>
        <Grid size={6}>
          <div>Cloudflare</div>
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
        </Grid>
        <Grid size={6}>
          <div>Mux</div>
          <video
            className="video-js vjs-fluid"
            id="mux-player"
            ref={muxPlayerRef}
            controls
          >
            <source
              src="https://stream.mux.com/JByFsXLBYRuHPcWc74g02ZEoxo5RtbMTCuRLkMwIlUgU.m3u8"
              type="application/x-mpegURL"
            />
          </video>
        </Grid>
      </Grid>
    </Box>
  )
}
