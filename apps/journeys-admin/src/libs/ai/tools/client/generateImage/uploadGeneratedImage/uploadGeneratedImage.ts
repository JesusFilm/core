import { gql } from '@apollo/client'
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { ImageBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'

// Reuse the same mutation as in the ImageUpload component
export const AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE = gql`
  mutation AiCreateCloudflareUploadByFile {
    createCloudflareUploadByFile {
      uploadUrl
      id
    }
  }
`

interface UploadGeneratedImageResponse {
  src: string
  success: boolean
}

/**
 * Uploads a base64 image to Cloudflare Images via the API
 *
 * @param client - Apollo client instance
 * @param base64Image - Base64 encoded image string from AI generation
 * @param filename - Optional filename (defaults to "ai-generated.png")
 * @returns Object with src URL and success status
 */
export async function uploadGeneratedImage(
  client: ApolloClient<NormalizedCacheObject>,
  base64Image: string,
  filename = 'ai-generated.png'
): Promise<UploadGeneratedImageResponse> {
  try {
    // Remove the data:image/... prefix if present
    const base64Data = base64Image.includes('base64,')
      ? base64Image.split('base64,')[1]
      : base64Image

    // Convert base64 to binary data
    const binaryData = atob(base64Data)

    // Create array buffer from binary data
    const arrayBuffer = new ArrayBuffer(binaryData.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i)
    }

    // Create Blob and File objects
    const blob = new Blob([uint8Array], { type: 'image/png' })
    const file = new File([blob], filename, { type: 'image/png' })

    // Get upload URL from Cloudflare
    const { data } = await client.mutate({
      mutation: AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE
    })

    if (!data?.createCloudflareUploadByFile?.uploadUrl) {
      throw new Error('Failed to get upload URL')
    }

    // Create form data
    const formData = new FormData()
    formData.append('file', file)

    // Upload the file to Cloudflare
    const response = await fetch(data.createCloudflareUploadByFile.uploadUrl, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudflare')
    }

    const responseData = await response.json()

    if (!responseData.success) {
      throw new Error(responseData.errors?.join(', ') || 'Unknown upload error')
    }

    // Construct the image URL
    const uploadId = responseData.result.id
    const src = `https://imagedelivery.net/${
      process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
    }/${uploadId}/public`

    return {
      src,
      success: true
    }
  } catch (error) {
    console.error('Error uploading generated image:', error)
    return {
      src: '',
      success: false
    }
  }
}

/**
 * Helper function that returns an ImageBlockUpdateInput with the src from the uploaded image
 *
 * @param src - Image source URL
 * @returns ImageBlockUpdateInput object
 */
export function createImageBlockInput(src: string): ImageBlockUpdateInput {
  return { src }
}
