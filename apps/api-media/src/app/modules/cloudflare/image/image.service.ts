import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import fetch from 'node-fetch'
import FormData from 'form-data'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { CloudflareImage } from '../../../__generated__/graphql'

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

@Injectable()
export class ImageService extends BaseService {
  collection = this.db.collection('cloudflareImages')
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

  async deleteImageFromCloudflare(
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

  async uploadToCloudlareByUrl(
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

  @KeyAsId()
  async getCloudflareImagesForUserId(
    userId: string
  ): Promise<CloudflareImage[]> {
    const res = await this.db.query(aql`
      FOR item in ${this.collection}
        FILTER item.userId == ${userId} && item.uploaded == true        
        RETURN item
    `)
    return await res.all()
  }
}
