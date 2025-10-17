import type { NextApiRequest, NextApiResponse } from 'next'

import { callStudioGraphQL } from '../../../src/server/graphqlClient'

const CREATE_MUX_VIDEO_UPLOAD_BY_FILE = `
  mutation CreateMuxVideoUploadByFile($name: String!) {
    createMuxVideoUploadByFile(name: $name) {
      id
      uploadUrl
    }
  }
`

interface CreateUploadResponse {
  createMuxVideoUploadByFile: {
    id: string
    uploadUrl: string
  } | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''

  if (!name) {
    res.status(400).json({ error: 'Missing video name' })
    return
  }

  try {
    const data = await callStudioGraphQL<CreateUploadResponse>(
      CREATE_MUX_VIDEO_UPLOAD_BY_FILE,
      {
        variables: { name },
        token: req.headers.authorization
      }
    )

    const payload = data.createMuxVideoUploadByFile

    if (!payload?.id || !payload?.uploadUrl) {
      throw new Error('Invalid response from GraphQL when creating Mux upload')
    }

    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ uploadId: payload.id, uploadUrl: payload.uploadUrl })
  } catch (error) {
    console.error('Failed to create Mux upload for Studio step:', error)
    res
      .status(500)
      .json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create Mux upload'
      })
  }
}

