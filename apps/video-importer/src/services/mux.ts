import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_MUX_VIDEO } from '../gql/mutations'
import { GET_MUX_VIDEO } from '../gql/queries'
import type { MuxVideoResponse, MuxVideoStatusResponse } from '../types'

const LARGE_FILE_THRESHOLD = 1024 * 1024 * 1024 // 1GB

const POLLING_PROFILES = {
  regular: {
    timeoutMinutes: 45,
    intervalSeconds: 30
  },
  large: {
    timeoutMinutes: 150,
    intervalSeconds: 120
  }
} as const

async function pollForMuxCompletion(
  muxId: string,
  profile: 'regular' | 'large'
): Promise<{ id: string; playbackId: string }> {
  const client = await getGraphQLClient()
  const config = POLLING_PROFILES[profile]
  const maxAttempts = Math.floor(
    (config.timeoutMinutes * 60) / config.intervalSeconds
  )

  console.log(
    `[Mux Service] Polling for ${muxId} completion (${profile} profile: ${config.timeoutMinutes}min timeout, ${config.intervalSeconds}s intervals)`
  )

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.request<MuxVideoStatusResponse>(
        GET_MUX_VIDEO,
        {
          id: muxId,
          userGenerated: false
        }
      )

      if (response?.getMyMuxVideo?.readyToStream === true) {
        const { id, playbackId } = response.getMyMuxVideo
        console.log(
          `[Mux Service] Video ${id} ready with playback ID: ${playbackId}`
        )
        return { id, playbackId }
      }

      if (attempt % 10 === 0) {
        const elapsedMinutes = Math.round(
          (attempt * config.intervalSeconds) / 60
        )
        console.log(
          `[Mux Service] Still processing ${muxId}... (${elapsedMinutes} minutes elapsed)`
        )
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.intervalSeconds * 1000)
        )
      }
    } catch (error) {
      console.warn(`[Mux Service] Polling attempt ${attempt} failed:`, error)

      if (attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.intervalSeconds * 1000)
        )
      }
    }
  }

  throw new Error(
    `Mux video processing timed out after ${config.timeoutMinutes} minutes`
  )
}

export async function createAndWaitForMuxVideo(
  publicUrl: string,
  fileSizeBytes?: number
): Promise<{ id: string; playbackId: string }> {
  const client = await getGraphQLClient()

  const response = await client.request<MuxVideoResponse>(CREATE_MUX_VIDEO, {
    url: publicUrl,
    userGenerated: false
  })

  const muxId = response.createMuxVideoUploadByUrl?.id
  if (!muxId) {
    throw new Error('Failed to create Mux video - no ID returned')
  }

  console.log(`[Mux Service] Created Mux video: ${muxId}`)

  const profile =
    fileSizeBytes && fileSizeBytes > LARGE_FILE_THRESHOLD ? 'large' : 'regular'

  return await pollForMuxCompletion(muxId, profile)
}
