import { MutableRefObject, ReactElement, RefObject, useEffect } from 'react'
import videojs from 'video.js'

import { useVideo } from '../../../../libs/videoContext'

interface VideoHeroPlayerProps {
  videoRef: RefObject<HTMLVideoElement>
  playerRef: MutableRefObject<videojs.Player | undefined>
  playVideo: () => void
}

export function VideoHeroPlayer({
  videoRef,
  playerRef,
  playVideo
}: VideoHeroPlayerProps): ReactElement {
  const { variant } = useVideo()

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        responsive: true
      })
      playerRef.current.on('play', playVideo)
    }
  }, [playerRef, videoRef, playVideo])

  return (
    <>
      {variant?.hls != null && (
        <video
          ref={videoRef}
          id="vjs-jfp"
          className="vjs-jfp video-js vjs-fill"
          style={{
            alignSelf: 'center',
            position: 'relative'
          }}
          playsInline
        >
          <source src={variant.hls} type="application/x-mpegURL" />
        </video>
      )}
    </>
  )
}
