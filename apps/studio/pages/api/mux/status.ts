import type { NextApiRequest, NextApiResponse } from 'next'

import { callStudioGraphQL } from '../../../src/server/graphqlClient'

const GET_MY_MUX_VIDEO = `
  query GetMyMuxVideo($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      assetId
      playbackId
      readyToStream
      duration
    }
  }
`

interface GetMuxVideoResponse {
  getMyMuxVideo: {
    id: string
    assetId: string | null
    playbackId: string | null
    readyToStream: boolean
    duration: number | null
  } | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const uploadIdParam = req.query.id
  const uploadId = Array.isArray(uploadIdParam)
    ? uploadIdParam[0]
    : uploadIdParam

  if (!uploadId) {
    res.status(400).json({ error: 'Missing upload id' })
    return
  }

  try {
    const data = await callStudioGraphQL<GetMuxVideoResponse>(GET_MY_MUX_VIDEO, {
      variables: { id: uploadId },
      token: req.headers.authorization
    })

    const video = data.getMyMuxVideo

    if (!video) {
      res.status(404).json({ error: 'Mux upload not found' })
      return
    }

    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ video })
  } catch (error) {
    console.error('Failed to load Mux upload status for Studio step:', error)
    res
      .status(500)
      .json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load Mux upload status'
      })
  }
}

