import {
  Dispatch,
  ReactElement,
  RefObject,
  SetStateAction,
  useEffect,
  useState
} from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock, useBlocks } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { ImageFields } from '../../Image/__generated__/ImageFields'

interface InitAndPlayProps {
  videoRef: RefObject<HTMLVideoElement>
  player?: Player
  setPlayer: Dispatch<SetStateAction<Player | undefined>>
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
}

const waitForBuffer = async (player: Player): Promise<void> => {
  return await new Promise((resolve) => {
    const maxWaitTime = 10000 // 10 seconds
    const startTime = Date.now()

    const checkBuffer = () => {
      // Add timeout protection
      if (Date.now() - startTime > maxWaitTime) {
        resolve()
        return
      }

      if (player.readyState() >= 3 && player.networkState() !== 2) {
        resolve()
      } else {
        setTimeout(checkBuffer, 150)
      }
    }
    checkBuffer()
  })
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
  activeStep = false
}: InitAndPlayProps): ReactElement {
  const { variant } = useJourney()
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const [error, setError] = useState(false)

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
          muted: muted === true,
          autoplay:
            autoplay === true &&
            activeStep &&
            source === VideoBlockSource.youTube
        })
      )
    }
  }, [
    startAt,
    endAt,
    muted,
    posterBlock,
    setPlayer,
    videoRef,
    autoplay,
    activeStep,
    source
  ])

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

    const handlePlay = async (): Promise<void> => {
      if (source === VideoBlockSource.youTube) {
        try {
          setLoading(true)
          await waitForBuffer(player)

          if (!activeStep) return

          const block = activeBlock.children[0]?.children[0] ?? undefined
          const onFirstStep =
            block?.__typename === 'VideoBlock' && activeBlock?.parentOrder === 0
          if (onFirstStep) {
            player.muted(true)
          }

          const playPromise = player.play()
          if (playPromise != null) {
            await playPromise
          }
        } catch (error) {
          console.error('[Video Debug] Play error:', error)
          player.muted(true)
          setError(true)
        } finally {
          setLoading(false)
        }
      }
    }

    if (activeStep) {
      void handlePlay()
    }
  }, [
    activeStep,
    activeBlock,
    autoplay,
    blockId,
    player,
    setError,
    error,
    source,
    setLoading
  ])

  // Pause video when inactive or admin
  useEffect(() => {
    if (player == null) return
    if (!activeStep || selectedBlock !== undefined) {
      player.pause()
    }
  }, [activeStep, player, selectedBlock])
  return <></>
}
