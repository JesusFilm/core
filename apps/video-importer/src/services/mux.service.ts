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
    let statusResponse: MuxVideoStatusResponse | undefined
    try {
      statusResponse = await client.request<MuxVideoStatusResponse>(
        GET_MUX_VIDEO,
        {
          id: muxId,
          userGenerated: false
        }
      )
    } catch (error) {
      console.error(
        `     [Mux Service] GraphQL error checking Mux video status (attempt ${attempt + 1}/${MAX_ATTEMPTS}):`,
        error
      )
      // Continue polling despite the error - the next attempt might succeed
      const waitMs = BACKOFF_INTERVALS[attempt]
      await new Promise((resolve) => setTimeout(resolve, waitMs))
      continue
    }

    if (statusResponse?.getMyMuxVideo.readyToStream) {
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

  const MAX_EXTENDED_ATTEMPTS = 20
  const POLLING_START_TIME = Date.now()
  const MAX_POLLING_TIME_MS = 3 * 60 * 60 * 1000 // 3 hours

  let attempt = MAX_ATTEMPTS
  while (attempt < MAX_ATTEMPTS + MAX_EXTENDED_ATTEMPTS) {
    let statusResponse: MuxVideoStatusResponse | undefined
    try {
      statusResponse = await client.request<MuxVideoStatusResponse>(
        GET_MUX_VIDEO,
        {
          id: muxId,
          userGenerated: false
        }
      )
    } catch (error) {
      console.error(
        `     [Mux Service] GraphQL error checking Mux video status (extended polling, attempt ${attempt}):`,
        error
      )
      // Continue polling despite the error
      const waitMs = BACKOFF_INTERVALS[BACKOFF_INTERVALS.length - 1]
      await new Promise((resolve) => setTimeout(resolve, waitMs))
      attempt++
      // Check if we've exceeded the maximum polling time
      if (Date.now() - POLLING_START_TIME > MAX_POLLING_TIME_MS) {
        console.error(
          `     [Mux Service] Exceeded maximum polling time (${MAX_POLLING_TIME_MS / (60 * 60 * 1000)} hours) for Mux Video ID ${muxId}. Aborting.`
        )
        break
      }
      continue
    }

    if (statusResponse?.getMyMuxVideo.readyToStream) {
      console.log(
        `       [Mux Service] Mux Video ID: ${muxId} is now readyToStream (extended polling).`
      )
      return {
        id: statusResponse.getMyMuxVideo.id,
        playbackId: statusResponse.getMyMuxVideo.playbackId
      }
    }

    // Check if we've exceeded the maximum polling time
    if (Date.now() - POLLING_START_TIME > MAX_POLLING_TIME_MS) {
      console.error(
        `     [Mux Service] Exceeded maximum polling time (${MAX_POLLING_TIME_MS / (60 * 60 * 1000)} hours) for Mux Video ID ${muxId}. Aborting.`
      )
      break
    }

    const waitMs = BACKOFF_INTERVALS[BACKOFF_INTERVALS.length - 1]
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    attempt++
  }
  throw new Error(
    `       [Mux Service] Mux video ${muxId} not ready after extended polling – aborting.`
  )
}
