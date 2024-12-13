/* eslint-disable i18next/no-literal-string */
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Link from 'next/link'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'videojs-mux'

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
      },
      plugins: {
        mux: {
          debug: false,
          data: {
            env_key: 'e2thjm49ulacc6tgf56laoeak',
            player_name: 'test player',
            video_title: 'cloudflare'
          }
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
      <Box>
        <Link href="/3-video-test-a" passHref legacyBehavior>
          <Chip label="A" clickable color="primary" />
        </Link>
        <Link href="/3-video-test-b" passHref legacyBehavior>
          <Chip label="B" clickable />
        </Link>
        <Link href="/3-video-test-c" passHref legacyBehavior>
          <Chip label="C" clickable />
        </Link>
      </Box>
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
