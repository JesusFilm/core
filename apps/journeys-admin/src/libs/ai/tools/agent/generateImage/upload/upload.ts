import { gql } from '@apollo/client'
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { AiCreateCloudflareUploadByFileMutation } from '../../../../../../../__generated__/AiCreateCloudflareUploadByFileMutation'

// Reuse the same mutation as in the ImageUpload component
export const AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE = gql`
  mutation AiCreateCloudflareUploadByFileMutation {
    createCloudflareUploadByFile {
      id
      uploadUrl
    }
  }
`

interface UploadGeneratedImageResponseSuccess {
  src: string
  success: true
}

interface UploadGeneratedImageResponseError {
  errorMessage: string
  success: false
}

type UploadGeneratedImageResponse =
  | UploadGeneratedImageResponseSuccess
  | UploadGeneratedImageResponseError

/**
 * Uploads a Uint8Array image to Cloudflare Images via the API
 *
 * @param client - Apollo client instance
 * @param uint8Array - Uint8Array of the image
 * @returns Object with src URL and success status
 */
export async function upload(
  client: ApolloClient<NormalizedCacheObject>,
  uint8Array: Uint8Array<ArrayBufferLike>
): Promise<UploadGeneratedImageResponse> {
  try {
    // Get upload URL from Cloudflare
    const { data } =
      await client.mutate<AiCreateCloudflareUploadByFileMutation>({
        mutation: AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE
      })

    if (!data?.createCloudflareUploadByFile?.uploadUrl) {
      throw new Error('Failed to get upload URL')
    }

    // // Create form data
    const formData = new FormData()
    formData.append('file', new Blob([uint8Array]))

    // // Upload the file to Cloudflare
    const response = await fetch(data.createCloudflareUploadByFile.uploadUrl, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudflare')
    }

    // Construct the image URL
    const uploadId = data.createCloudflareUploadByFile.id
    const src = `https://imagedelivery.net/${
      process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
    }/${uploadId}/public`

    return {
      src,
      success: true
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorMessage: error.message,
        success: false
      }
    }
    return {
      errorMessage: 'Failed to upload image to Cloudflare',
      success: false
    }
  }
}
