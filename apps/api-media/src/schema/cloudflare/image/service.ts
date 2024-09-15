import 'cloudflare/shims/node'

import Cloudflare from 'cloudflare'
import fetch, { Response } from 'node-fetch'

export function getClient(): Cloudflare {
  if (process.env.CLOUDFLARE_IMAGES_TOKEN == null)
    throw new Error('Missing CLOUDFLARE_IMAGES_TOKEN')

  return new Cloudflare({
    apiToken: process.env.CLOUDFLARE_IMAGES_TOKEN,
    fetch
  })
}

export async function createImageByDirectUpload(): Promise<Cloudflare.Images.V2.DirectUploads.DirectUploadCreateResponse> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  return await getClient().images.v2.directUploads.create({
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    requireSignedURLs: false
  })
}

export async function createImageFromResponse(
  response: Response
): Promise<Cloudflare.Images.V1.Image> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  return await getClient().images.v1.create({
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    requireSignedURLs: false,
    file: response
  })
}

export async function createImageFromText(prompt: string): Promise<Response> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  return await getClient()
    .post(
      `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        body: {
          prompt
        }
      }
    )
    .asResponse()
}

export async function createImageFromUrl(
  url: string
): Promise<Cloudflare.Images.V1.Image> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  return await getClient().images.v1.create({
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    requireSignedURLs: false,
    url
  })
}

export async function deleteImage(imageId: string): Promise<unknown> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  return await getClient().images.v1.delete(imageId, {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID
  })
}
