import FormData from 'form-data'
import fetch from 'node-fetch'

interface CloudflareDirectCreatorUploadResponse {
  result: {
    id: string
    uploadURL: string
  }
  result_info?: string
  success: boolean
  errors: string[]
  messages: string[]
}

interface CloudflarUrlUploadResponse {
  result: {
    id: string
  }
  success: boolean
  errors: string[]
  messages: string[]
}

export async function getImageInfoFromCloudflare(): Promise<CloudflareDirectCreatorUploadResponse> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${
      process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
    }/images/v2/direct_upload?requireSignedURLs=true&metadata={"key":"value"}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN ?? ''}`
      }
    }
  )
  return await response.json()
}

export async function uploadImageToCloudflare(
  file
): Promise<CloudflareDirectCreatorUploadResponse> {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${
      process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
    }/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN ?? ''}`
      },
      body
    }
  )
  return await response.json()
}

export async function deleteImageFromCloudflare(
  imageId: string
): Promise<CloudflareDirectCreatorUploadResponse> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${
      process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
    }/images/v1/${imageId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN ?? ''}`
      }
    }
  )
  return await response.json()
}

export async function uploadToCloudlareByUrl(
  url: string
): Promise<CloudflarUrlUploadResponse> {
  const formData = new FormData()
  formData.append('url', url)
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${
      process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
    }/images/v1?requireSignedURLs=false&metadata={"key":"value"}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN ?? ''}`
      },
      body: formData
    }
  )
  return await response.json()
}
