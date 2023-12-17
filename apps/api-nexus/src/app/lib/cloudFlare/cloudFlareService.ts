import { Injectable } from '@nestjs/common/decorators/core'

export interface CloudflareVideoUrlUploadResponse {
  result: {
    uid: string
  } | null
  success: boolean
  errors: string[]
  messages: string[]
}

@Injectable()
export class CloudFlareService {
  rootUrl: string
  constructor() {
    this.rootUrl = 'https://api.cloudflare.com/client/v4/accounts/'
  }

  async uploadToCloudflareByUrl(
    url: string,
    fileName: string,
    userName: string
  ): Promise<CloudflareVideoUrlUploadResponse> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${
        process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
      }/stream/copy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, creator: userName, name: fileName })
      }
    )
    return await response.json()
  }
}