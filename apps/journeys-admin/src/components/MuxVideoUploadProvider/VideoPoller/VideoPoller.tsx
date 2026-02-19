import { useLazyQuery } from '@apollo/client'
import { ReactElement, useEffect, useRef } from 'react'

import { GetMyMuxVideoQuery } from '../../../../__generated__/GetMyMuxVideoQuery'
import { GET_MY_MUX_VIDEO_QUERY } from '../MuxVideoUploadProvider'
import { MAX_POLL_TIME, POLL_INTERVAL } from '../utils/constants'

interface VideoPollerProps {
  videoId: string
  startTime: number
  onComplete: () => void
  onError: (error: string) => void
  onTimeout: () => void
  registerStopPolling: (videoId: string, stopFn: () => void) => void
  unregisterStopPolling: (videoId: string) => void
}

/**
 * Invisible component that polls a single video using Apollo's built-in polling.
 * Each video being polled gets its own instance, which is much simpler
 * than managing polling manually with setInterval/setTimeout.
 */
export function VideoPoller({
  videoId,
  startTime,
  onComplete,
  onError,
  onTimeout,
  registerStopPolling,
  unregisterStopPolling
}: VideoPollerProps): ReactElement | null {
  const hasCompletedRef = useRef(false)

  const [getMyMuxVideo, { stopPolling }] = useLazyQuery<GetMyMuxVideoQuery>(
    GET_MY_MUX_VIDEO_QUERY,
    {
      pollInterval: POLL_INTERVAL,
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // Prevent duplicate completions
        if (hasCompletedRef.current) return

        const video = data?.getMyMuxVideo
        const isVideoReady =
          video?.readyToStream === true &&
          video?.assetId != null &&
          video?.playbackId != null

        if (isVideoReady) {
          hasCompletedRef.current = true
          stopPolling()
          unregisterStopPolling(videoId)
          onComplete()
          return
        }

        // Check for timeout
        if (Date.now() - startTime > MAX_POLL_TIME) {
          hasCompletedRef.current = true
          stopPolling()
          unregisterStopPolling(videoId)
          onTimeout()
        }
      },
      onError: (error) => {
        if (hasCompletedRef.current) return
        hasCompletedRef.current = true
        stopPolling()
        unregisterStopPolling(videoId)
        onError(error.message)
      }
    }
  )

  // Start polling on mount
  useEffect(() => {
    // Register stopPolling so it can be called externally (for cancellation)
    registerStopPolling(videoId, () => {
      hasCompletedRef.current = true
      stopPolling()
    })

    // Start the initial query (which will then poll automatically)
    void getMyMuxVideo({ variables: { id: videoId } })

    // Cleanup on unmount
    return () => {
      hasCompletedRef.current = true
      stopPolling()
      unregisterStopPolling(videoId)
    }
  }, [
    videoId,
    getMyMuxVideo,
    stopPolling,
    registerStopPolling,
    unregisterStopPolling
  ])

  // This component renders nothing - it's just for the polling logic
  return null
}
