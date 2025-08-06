import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_MUX_VIDEO } from '../gql/mutations'
import { GET_MUX_VIDEO } from '../gql/queries'
import type { MuxVideoResponse, MuxVideoStatusResponse } from '../types'

export interface MuxVideoInitResult {
  id: string
  publicUrl: string
  fileSizeBytes?: number
}

export interface MuxVideoProcessingResult {
  id: string
  playbackId: string
  readyToStream: boolean
}

export interface PendingMuxVideo {
  id: string
  publicUrl: string
  fileSizeBytes?: number
}

export async function createMuxAsset(
  publicUrl: string,
  fileSizeBytes?: number
): Promise<MuxVideoInitResult> {
  const client = await getGraphQLClient()

  const response = await client.request<MuxVideoResponse>(CREATE_MUX_VIDEO, {
    url: publicUrl,
    userGenerated: false
  })

  const muxId = response.createMuxVideoUploadByUrl?.id
  if (!muxId) {
    throw new Error('Failed to create Mux video - no ID returned')
  }

  console.log(`[Mux Service] Created Mux asset: ${muxId}`)

  return {
    id: muxId,
    publicUrl,
    fileSizeBytes
  }
}

export async function checkMuxVideoStatus(
  muxId: string
): Promise<MuxVideoProcessingResult> {
  const client = await getGraphQLClient()

  const response = await client.request<MuxVideoStatusResponse>(GET_MUX_VIDEO, {
    id: muxId,
    userGenerated: false
  })

  const video = response?.getMyMuxVideo
  if (!video) {
    throw new Error(`Mux video ${muxId} not found`)
  }

  return {
    id: video.id,
    playbackId: video.playbackId || '',
    readyToStream: video.readyToStream
  }
}

/**
 * Wait for a Mux video to complete processing
 */
export async function waitForMuxVideoCompletion(
  muxId: string,
  timeoutMinutes: number = 150
): Promise<{ id: string; playbackId: string }> {
  const maxAttempts = Math.floor((timeoutMinutes * 60) / 5) // Check every 5 seconds
  let currentInterval = 5

  console.log(`[Mux Service] Waiting for ${muxId} to complete processing...`)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const status = await checkMuxVideoStatus(muxId)

      if (status.readyToStream && status.playbackId) {
        console.log(
          `[Mux Service] Video ${muxId} ready with playback ID: ${status.playbackId}`
        )
        return { id: status.id, playbackId: status.playbackId }
      }

      // Log progress every 10 attempts
      if (attempt % 10 === 0) {
        const elapsedMinutes = Math.round((attempt * currentInterval) / 60)
        console.log(
          `[Mux Service] Still processing ${muxId}... (${elapsedMinutes} minutes elapsed)`
        )
      }

      if (attempt < maxAttempts) {
        const interval = currentInterval
        await new Promise((resolve) => setTimeout(resolve, interval * 1000))

        // Increase interval gradually (max 2 minutes)
        currentInterval = Math.min(currentInterval * 1.5, 120)
      }
    } catch (error) {
      console.warn(`[Mux Service] Polling attempt ${attempt} failed:`, error)

      if (attempt < maxAttempts) {
        const interval = currentInterval
        await new Promise((resolve) => setTimeout(resolve, interval * 1000))
      }
    }
  }

  throw new Error(
    `Mux video processing timed out after ${timeoutMinutes} minutes`
  )
}

/**
 * Process multiple pending Mux videos
 */
export async function processPendingMuxVideos(
  pendingVideos: PendingMuxVideo[]
): Promise<{ id: string; playbackId: string }[]> {
  if (pendingVideos.length === 0) {
    console.log('[Mux Service] No pending videos to process')
    return []
  }

  console.log(
    `[Mux Service] Processing ${pendingVideos.length} pending videos...`
  )

  const results: { id: string; playbackId: string }[] = []

  for (const video of pendingVideos) {
    try {
      console.log(`[Mux Service] Waiting for video ${video.id} to complete...`)
      const result = await waitForMuxVideoCompletion(video.id)
      results.push(result)
      console.log(`[Mux Service] Video ${video.id} completed successfully`)
    } catch (error) {
      console.error(`[Mux Service] Failed to process video ${video.id}:`, error)
      throw error
    }
  }

  console.log(`[Mux Service] Successfully processed ${results.length} videos`)
  return results
}
