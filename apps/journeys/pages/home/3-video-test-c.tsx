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
            video_title: 'brightcove'
          }
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
      <Box>
        <Link href="/3-video-test-a" passHref legacyBehavior>
          <Chip label="A" clickable />
        </Link>
        <Link href="/3-video-test-b" passHref legacyBehavior>
          <Chip label="B" clickable />
        </Link>
        <Link href="/3-video-test-c" passHref legacyBehavior>
          <Chip label="C" clickable color="primary" />
        </Link>
      </Box>
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
