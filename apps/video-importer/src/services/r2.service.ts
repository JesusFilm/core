import { createReadStream } from 'fs'

import fetch from 'node-fetch'

import { CREATE_R2_ASSET } from './gql/mutations'
import { getGraphQLClient } from './graphqlClient'

export async function createR2Asset({
  fileName,
  contentType,
  originalFilename,
  contentLength,
  videoId
}: {
  fileName: string
  contentType: string
  originalFilename: string
  contentLength: number
  videoId: string
}) {
  const client = await getGraphQLClient()

  // Convert to string to handle large numbers
  const contentLengthStr = contentLength.toString()

  console.log(`     [R2 Service] File size: ${contentLengthStr} bytes`)

  const data: { cloudflareR2Create: { uploadUrl: string; publicUrl: string } } =
    await client.request(CREATE_R2_ASSET, {
      input: {
        fileName,
        contentType,
        originalFilename,
        contentLength: parseInt(contentLengthStr),
        videoId
      }
    })
  return data.cloudflareR2Create
}

export async function uploadToR2(
  uploadUrl: string,
  filePath: string,
  contentType: string,
  contentLength: number
) {
  const fileStream = createReadStream(filePath)
  fileStream.on('error', (err) => {
    throw new Error(`Failed to read file stream: ${err.message}`)
  })

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Content-Length': contentLength.toString()
    },
    body: fileStream
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Failed to upload to R2. Status: ${response.status} ${response.statusText}. Body: ${errorBody}`
    )
  }
  console.log('     [R2 Service] Successfully uploaded.')
}
