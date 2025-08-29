import type { MuxVideoResponse, MuxVideoStatusResponse } from '../types'

import { CREATE_MUX_VIDEO } from './gql/mutations'
import { GET_MUX_VIDEO } from './gql/queries'
import { getGraphQLClient } from './graphqlClient'

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

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn()
      if (isComplete(result)) {
        return result
      }
    } catch (error) {
      console.error(`Polling attempt ${attempt} failed:`, error)
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }

  throw new Error(`Polling failed after ${maxAttempts} attempts`)
}

export async function createAndWaitForMuxVideo(publicUrl: string): Promise<{
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

  const statusResponse = await poll(
    () =>
      client.request<MuxVideoStatusResponse>(GET_MUX_VIDEO, {
        id: muxId,
        userGenerated: false
      }),
    (response) => response?.getMyMuxVideo.readyToStream === true,
    {
      maxAttempts: 61, // 10 minutes total: 61 attempts at 10s intervals
      intervalMs: 10_000 // 10 seconds between attempts
    }
  )

  console.log(`[Mux Service] Mux Video ID: ${muxId} is now readyToStream`)
  return {
    id: statusResponse.getMyMuxVideo.id,
    playbackId: statusResponse.getMyMuxVideo.playbackId
  }
}
