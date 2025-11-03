import {
  Dispatch,
  ReactElement,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import videojs from 'video.js'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock, useBlocks } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields_mediaVideo } from '../__generated__/VideoFields'
import { getMuxMetadata } from '../utils/getMuxMetadata'
import VideoJsPlayer from '../utils/videoJsTypes'

import 'videojs-mux'

interface InitAndPlayProps {
  videoRef: RefObject<HTMLVideoElement | null>
  player?: VideoJsPlayer
  setPlayer: Dispatch<SetStateAction<VideoJsPlayer | undefined>>
  triggerTimes: number[]
  videoEndTime: number
  selectedBlock?: TreeBlock
  blockId: string
  muted: boolean | null
  startAt: number | null
  endAt: number | null
  autoplay: boolean | null
  posterBlock: TreeBlock<ImageFields> | undefined
  source: VideoBlockSource
  setLoading: Dispatch<SetStateAction<boolean>>
  setShowPoster: Dispatch<SetStateAction<boolean>>
  setVideoEndTime: Dispatch<SetStateAction<number>>
  activeStep?: boolean
  title: string | null
  mediaVideo: VideoFields_mediaVideo | null
  videoVariantLanguageId: string | null
}

export function InitAndPlay({
  videoRef,
  player,
  setPlayer,
  triggerTimes,
  videoEndTime,
  selectedBlock,
  blockId,
  muted,
  startAt,
  endAt,
  autoplay,
  posterBlock,
  source,
  setLoading,
  setShowPoster,
  setVideoEndTime,
  activeStep = false,
  title,
  mediaVideo,
  videoVariantLanguageId
}: InitAndPlayProps): ReactElement {
  const { journey, variant } = useJourney()
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const [error, setError] = useState(false)
  const playerInitializedRef = useRef(false)

  const muxMetadata = useMemo(() => {
    return journey != null
      ? getMuxMetadata({
          journeyId: journey.id,
          videoBlock: {
            id: blockId,
            title,
            mediaVideo,
            endAt,
            videoVariantLanguageId
          }
        })
      : {}
  }, [journey, blockId, title, mediaVideo, endAt, videoVariantLanguageId])

  // Initiate video player
  useEffect(() => {
    if (videoRef.current != null && !playerInitializedRef.current) {
      setPlayer(
        videojs(videoRef.current, {
          ...defaultVideoJsOptions,
          controls: false,
          controlBar: false,
          bigPlayButton: false,
          loadingSpinner: false,
          // Make video fill container instead of set aspect ratio
          fill: true,
          userActions: {
            hotkeys: true,
            doubleClick: true
          },
          responsive: true,
          muted: muted === true,
          autoplay: autoplay === true && source === VideoBlockSource.youTube,
          plugins: {
            mux: {
              debug: false,
              data: muxMetadata
            }
          }
        }) as VideoJsPlayer
      )
      playerInitializedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- should only run once unless videoRef.current is null
  }, [videoRef.current])

  // Initiate video player listeners
  useEffect(() => {
    const startTime = startAt ?? 0

    const handleStopLoading = (): void => {
      if (player != null && (player.currentTime() ?? 0) < startTime) {
        player.currentTime(startTime)
      }
      setLoading(false)
    }
    const handleVideoReady = (): void => {
      if (player != null) {
        player.currentTime(startTime)
        // iOS blocks videos from calling seeked so loading hangs
        void handleStopLoading()
      }
    }
    const handlePlaying = (): void => {
      handleStopLoading()
      setShowPoster(false)
    }
    const handleVideoEnd = (): void => {
      setLoading(false)
      if (
        player?.isFullscreen() === true &&
        player != null &&
        variant !== 'embed'
      ) {
        void player.exitFullscreen()
      }
    }

    if (player != null) {
      if (selectedBlock === undefined) {
        player.on('ready', handleVideoReady)
        // Video jumps to new time and finishes loading - occurs on autoplay
        player.on('seeked', handleStopLoading)
        player.on('canplay', handleStopLoading)
        player.on('playing', handlePlaying)
        player.on('ended', handleVideoEnd)
      }
    }

    return () => {
      if (player != null) {
        player.off('ready', handleVideoReady)
        player.off('seeked', handleStopLoading)
        player.off('canplay', handleStopLoading)
        player.off('playing', handlePlaying)
        player.off('ended', handleVideoEnd)
      }
    }
  }, [
    player,
    selectedBlock,
    startAt,
    autoplay,
    activeBlock,
    blockId,
    activeStep,
    variant,
    setLoading,
    setShowPoster
  ])

  // player.duration() can change after play
  useEffect(() => {
    if (player != null) {
      const handleDurationChange = (): void => {
        if (player != null) {
          const playerDuration =
            (player.duration() ?? 0) > 0 ? player.duration() : null

          if (playerDuration != null) {
            setVideoEndTime(Math.min(videoEndTime, playerDuration))
          }
        }
      }

      if (selectedBlock === undefined) {
        player.on('durationchange', handleDurationChange)
      }
      return () => {
        if (player != null) {
          player.off('durationchange', handleDurationChange)
        }
      }
    }
  }, [
    endAt,
    player,
    selectedBlock,
    triggerTimes,
    videoEndTime,
    setVideoEndTime
  ])

  // Play the video when active
  useEffect(() => {
    if (player == null || autoplay !== true) return

    if (activeStep) {
      const block = activeBlock.children[0]?.children[0] ?? undefined
      const onFirstStep =
        block?.__typename === 'VideoBlock' && activeBlock?.parentOrder === 0
      if (onFirstStep) {
        player.muted(true)
      }

      // Tries to autoplay, fallback to muted autoplay if not allowed
      const playPromise = player.play()
      if (playPromise != null) {
        playPromise.catch(() => {
          player.muted(true)
          setError(true)
        })
      }

      if (error) {
        void playPromise
      }
    }
  }, [activeStep, activeBlock, autoplay, blockId, player, setError, error])

  // Pause video when inactive or admin
  useEffect(() => {
    if (player == null) return
    if (!activeStep || selectedBlock !== undefined) {
      player.pause()
    }
  }, [activeStep, player, selectedBlock])

  return <></>
}
