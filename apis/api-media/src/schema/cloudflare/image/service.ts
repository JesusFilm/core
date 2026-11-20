// Force the Cloudflare SDK onto its "web" runtime so it uses Node's native
// global fetch (undici) + native Response/FormData. Without this, the SDK
// auto-detects the Node runtime and loads node-fetch@2, whose gzip stream
// handling throws "Premature close" on the alpine/musl prod runtime. This
// side-effect import MUST run before `cloudflare` so its setShims() wins over
// the SDK's auto-detection. [QA-530]
import 'cloudflare/shims/web'

import Cloudflare from 'cloudflare'
import { multipartFormRequestOptions } from 'cloudflare/core'

interface ImageGenerationResponse {
  result?: { image?: string }
}

export function getClient(): Cloudflare {
  if (process.env.CLOUDFLARE_IMAGES_TOKEN == null)
    throw new Error('Missing CLOUDFLARE_IMAGES_TOKEN')

  return new Cloudflare({
    apiToken: process.env.CLOUDFLARE_IMAGES_TOKEN
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

export async function createImageFromText(
  prompt: string
): Promise<Cloudflare.Images.V1.Image> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const client = getClient()
  const response: ImageGenerationResponse = await client.post(
    `/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-2-klein-9b`,
    multipartFormRequestOptions({ body: { prompt } })
  )
  const image = response.result?.image
  if (typeof image !== 'string' || image === '')
    throw new Error('Workers AI did not return generated image data')

  return await client.images.v1.create({
    account_id: accountId,
    requireSignedURLs: false,
    file: new File([Buffer.from(image, 'base64')], 'generated-image')
  })
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
