import { createReadStream } from 'fs'

import fetch from 'node-fetch'

import { CREATE_CLOUDFLARE_R2_ASSET } from './gql/mutations'
import { getGraphQLClient } from './graphqlClient'

export async function createR2Asset({
  fileName,
  contentType,
  originalFilename,
  videoId,
  contentLength
}: {
  fileName: string
  contentType: string
  originalFilename: string
  videoId: string
  contentLength: number
}) {
  const client = await getGraphQLClient()
  const safeContentLength = contentLength > 2_147_483_647 ? -1 : contentLength
  const data: { cloudflareR2Create: { uploadUrl: string; publicUrl: string } } =
    await client.request(CREATE_CLOUDFLARE_R2_ASSET, {
      input: {
        fileName,
        contentType,
        originalFilename,
        videoId,
        contentLength: safeContentLength
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
  let bytesSent = 0
  let lastLoggedPercent = 0
  fileStream.on('data', (chunk) => {
    bytesSent += chunk.length
    const percent = Math.floor((bytesSent / contentLength) * 100)
    if (percent >= lastLoggedPercent + 25) {
      console.log(
        `     [R2 Service] Upload progress: ${percent}% (${bytesSent}/${contentLength} bytes)`
      )
      lastLoggedPercent = percent
    }
  })
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
