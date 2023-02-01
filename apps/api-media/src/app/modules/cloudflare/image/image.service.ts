import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { DocumentCollection } from 'arangojs/collection'
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
@Injectable()
export class ImageService extends BaseService {
  collection: DocumentCollection = this.db.collection('cloudflareImages')
  async getImageInfoFromCloudflare(): Promise<CloudflareDirectCreatorUploadResponse> {
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
}
