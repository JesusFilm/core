import type { MuxVideoResponse, MuxVideoStatusResponse } from '../types'

import { CREATE_MUX_VIDEO } from './gql/mutations'
import { GET_MUX_VIDEO } from './gql/queries'
import { getGraphQLClient } from './graphqlClient'

// Calculate timeout based on file size
function calculateMuxTimeout(fileSizeBytes: number): number {
  // Base timeout: 30 minutes minimum
  const baseTimeoutMinutes = 30

  // Additional time per GB: 10 minutes per GB
  const additionalMinutesPerGB = 10

  // Calculate file size in GB
  const fileSizeGB = fileSizeBytes / (1024 * 1024 * 1024)

  // Calculate total timeout in minutes
  const totalTimeoutMinutes =
    baseTimeoutMinutes + fileSizeGB * additionalMinutesPerGB

  // Cap at 3 hours maximum
  const maxTimeoutMinutes = 180
  const finalTimeoutMinutes = Math.min(totalTimeoutMinutes, maxTimeoutMinutes)

  // Convert to polling attempts (10-second intervals)
  const pollingIntervalSeconds = 10
  const maxAttempts = Math.floor(
    (finalTimeoutMinutes * 60) / pollingIntervalSeconds
  )

  console.log(
    `[Mux Service] File size: ${fileSizeGB.toFixed(2)}GB, calculated timeout: ${finalTimeoutMinutes} minutes (${maxAttempts} attempts)`
  )

  return maxAttempts
}

// Calculate adaptive polling interval based on elapsed time
function calculateAdaptiveInterval(elapsedMinutes: number): number {
  // Start with 10 seconds for the first 5 minutes
  if (elapsedMinutes <= 5) return 10_000

  // Increase to 30 seconds for 5-15 minutes
  if (elapsedMinutes <= 15) return 30_000

  // Increase to 1 minute for 15-30 minutes
  if (elapsedMinutes <= 30) return 60_000

  // Increase to 2 minutes for 30-60 minutes
  if (elapsedMinutes <= 60) return 120_000

  // Cap at 5 minutes for anything longer
  return 300_000
}

async function poll<T>(
  fn: () => Promise<T>,
  isComplete: (result: T) => boolean,
  options: {
    maxAttempts?: number
    intervalMs?: number
    timeoutMs?: number
  } = {}
): Promise<T> {
  const { maxAttempts = 20, intervalMs = 5_000 } = options
  const startTime = Date.now()

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn()
      if (isComplete(result)) {
        return result
      }

      // Calculate adaptive interval based on elapsed time
      const elapsedMinutes = (Date.now() - startTime) / 60000
      const adaptiveInterval = calculateAdaptiveInterval(elapsedMinutes)

      // Log progress for long-running operations
      if (attempt % 30 === 0) {
        // Every 5 minutes (30 * 10s)
        console.log(
          `[Mux Service] Still processing... (${Math.floor(elapsedMinutes)} minutes elapsed, polling every ${adaptiveInterval / 1000}s)`
        )
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, adaptiveInterval))
      }
    } catch (error) {
      console.error(`Polling attempt ${attempt} failed:`, error)

      if (attempt < maxAttempts) {
        // Use adaptive interval even on errors
        const elapsedMinutes = (Date.now() - startTime) / 60000
        const adaptiveInterval = calculateAdaptiveInterval(elapsedMinutes)
        await new Promise((resolve) => setTimeout(resolve, adaptiveInterval))
      }
    }
  }

  throw new Error(`Polling failed after ${maxAttempts} attempts`)
}

export async function createAndWaitForMuxVideo(
  publicUrl: string,
  fileSizeBytes?: number
): Promise<{
  id: string
  playbackId: string
}> {
  const client = await getGraphQLClient()

  // Create the Mux video
  const muxResponse = await client.request<MuxVideoResponse>(CREATE_MUX_VIDEO, {
    url: publicUrl,
    userGenerated: false
  })

  if (!muxResponse.createMuxVideoUploadByUrl?.id) {
    console.error(
      '[Mux Service] Failed to create Mux video. Response:',
      muxResponse
    )
    throw new Error('Failed to create Mux video')
  }

  const muxId = muxResponse.createMuxVideoUploadByUrl.id
  console.log(
    `[Mux Service] Mux Video ID created: ${muxId}. Polling for readyToStream status...`
  )

  // Calculate dynamic timeout based on file size
  const maxAttempts = fileSizeBytes ? calculateMuxTimeout(fileSizeBytes) : 540 // Fallback: 90 minutes for unknown file size

  const statusResponse = await poll(
    () =>
      client.request<MuxVideoStatusResponse>(GET_MUX_VIDEO, {
        id: muxId,
        userGenerated: false
      }),
    (response) => response?.getMyMuxVideo.readyToStream === true,
    {
      maxAttempts,
      intervalMs: 10_000 // 10 seconds between attempts
    }
  )

  console.log(`[Mux Service] Mux Video ID: ${muxId} is now readyToStream`)
  return {
    id: statusResponse.getMyMuxVideo.id,
    playbackId: statusResponse.getMyMuxVideo.playbackId
  }
}
