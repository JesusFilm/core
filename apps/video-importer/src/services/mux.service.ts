import type { MuxVideoResponse, MuxVideoStatusResponse } from '../types'

import { CREATE_MUX_VIDEO } from './gql/mutations'
import { GET_MUX_VIDEO } from './gql/queries'
import { getGraphQLClient } from './graphqlClient'

export async function createAndWaitForMuxVideo(publicUrl: string): Promise<{
  id: string
  playbackId: string
}> {
  const client = await getGraphQLClient()

  const muxResponse = await client.request<MuxVideoResponse>(CREATE_MUX_VIDEO, {
    url: publicUrl,
    userGenerated: false
  })

  if (!muxResponse.createMuxVideoUploadByUrl?.id) {
    console.error(
      '     [Mux Service] Failed to create Mux video. Response:',
      muxResponse
    )
    throw new Error('Failed to create Mux video')
  }

  const muxId = muxResponse.createMuxVideoUploadByUrl.id
  console.log(
    `     [Mux Service] Mux Video ID created: ${muxId}. Polling for readyToStream status...`
  )

  const BACKOFF_INTERVALS = [
    10_000, 60_000, 120_000, 300_000, 600_000, 900_000, 1_200_000
  ]
  const MAX_ATTEMPTS = BACKOFF_INTERVALS.length

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const statusResponse = await client.request<MuxVideoStatusResponse>(
      GET_MUX_VIDEO,
      {
        id: muxId,
        userGenerated: false
      }
    )

    if (statusResponse.getMyMuxVideo.readyToStream) {
      console.log(
        `     [Mux Service] Mux Video ID: ${muxId} is now readyToStream.`
      )
      return {
        id: statusResponse.getMyMuxVideo.id,
        playbackId: statusResponse.getMyMuxVideo.playbackId
      }
    }

    const waitMs = BACKOFF_INTERVALS[attempt]
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  let attempt = MAX_ATTEMPTS
  while (true) {
    const statusResponse = await client.request<MuxVideoStatusResponse>(
      GET_MUX_VIDEO,
      {
        id: muxId,
        userGenerated: false
      }
    )

    if (statusResponse.getMyMuxVideo.readyToStream) {
      console.log(
        `       [Mux Service] Mux Video ID: ${muxId} is now readyToStream (extended polling).`
      )
      return {
        id: statusResponse.getMyMuxVideo.id,
        playbackId: statusResponse.getMyMuxVideo.playbackId
      }
    }

    const waitMs = BACKOFF_INTERVALS[BACKOFF_INTERVALS.length - 1]
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    attempt++
    if (attempt >= 20) {
      console.error(
        `       [Mux Service] Mux Video ID ${muxId} did not become ready after ${attempt} attempts. Aborting.`
      )
      break
    }
  }
  throw new Error(
    `       [Mux Service] Mux video ${muxId} not ready after extended polling – aborting.`
  )
}
