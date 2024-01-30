import {
  Dispatch,
  ReactElement,
  RefObject,
  SetStateAction,
  useEffect
} from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { TreeBlock, useBlocks } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'

interface InitAndPlayProps {
  videoRef: RefObject<HTMLVideoElement>
  player?: Player
  setPlayer: Dispatch<SetStateAction<Player | undefined>>
  activeStep: boolean
  triggerTimes: number[]
  videoEndTime: number
  selectedBlock?: TreeBlock
  blockId: string
  muted: boolean | null
  startAt: number | null
  endAt: number | null
  autoplay: boolean | null
  posterBlock: TreeBlock<ImageFields> | undefined
  setLoading: Dispatch<SetStateAction<boolean>>
  setShowPoster: Dispatch<SetStateAction<boolean>>
  setVideoEndTime: Dispatch<SetStateAction<number>>
}

export function InitAndPlay({
  videoRef,
  player,
  setPlayer,
  activeStep,
  triggerTimes,
  videoEndTime,
  selectedBlock,
  blockId,
  muted,
  startAt,
  endAt,
  autoplay,
  posterBlock,
  setLoading,
  setShowPoster,
  setVideoEndTime
}: InitAndPlayProps): ReactElement {
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]

  // Initiate video player
  useEffect(() => {
    if (videoRef.current != null) {
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
          muted: muted === true
        })
      )
    }
  }, [startAt, endAt, muted, posterBlock, setPlayer, videoRef])

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
      if (player?.isFullscreen() === true && player != null) {
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
      const onFirstStep = activeBlock?.parentOrder === 0
      if (onFirstStep) {
        player.muted(true)
      }
      // Tries to autoplay, fallback to muted autoplay if not allowed
      void player.play()?.catch((error) => {
        if (error.name === 'NotAllowedError') {
          player.muted(true)
          void player.play()
        }
      })
    }
  }, [activeStep, activeBlock, autoplay, blockId, player])

  // Pause video when inactive or admin
  useEffect(() => {
    if (player == null) return
    if (!activeStep || selectedBlock !== undefined) {
      player.pause()
    }
  }, [activeStep, player, selectedBlock])

  return <></>
}
