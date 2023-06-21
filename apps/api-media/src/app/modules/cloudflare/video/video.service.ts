import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import fetch from 'node-fetch'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { CloudflareVideo } from '../../../__generated__/graphql'

export interface CloudflareVideoUploadUrl {
  id: string
  uploadUrl: string
}
export interface CloudflareVideoUrlUploadResponse {
  result: {
    uid: string
  } | null
  success: boolean
  errors: string[]
  messages: string[]
}

export interface CloudflareVideoGetResponse {
  result: {
    readyToStream: boolean
  } | null
  success: boolean
  errors: string[]
  messages: string[]
}

@Injectable()
export class VideoService extends BaseService {
  collection = this.db.collection('cloudflareVideos')
  async uploadToCloudflareByFile(
    uploadLength: number,
    name: string,
    userId: string
  ): Promise<CloudflareVideoUploadUrl | undefined> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${
        process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
      }/stream?direct_user=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`,
          'Tus-Resumable': '1.0.0',
          'Upload-Length': uploadLength.toString(),
          'Upload-Creator': userId,
          'Upload-Metadata': 'name ' + btoa(name.replace(/\W/g, ''))
        }
      }
    )
    const uploadUrl = response.headers.get('Location')

    if (uploadUrl != null) {
      return {
        id: response.headers.get('stream-media-id') ?? '',
        uploadUrl
      }
    }
  }

  async deleteVideoFromCloudflare(videoId: string): Promise<boolean> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${
        process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
      }/stream/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`
        }
      }
    )
    return response.ok
  }

  async getVideoFromCloudflare(
    videoId: string
  ): Promise<CloudflareVideoGetResponse> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${
        process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
      }/stream/${videoId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`
        }
      }
    )
    return await response.json()
  }

  async uploadToCloudflareByUrl(
    url: string,
    userId: string
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
        body: JSON.stringify({ url, creator: userId })
      }
    )
    return await response.json()
  }

  @KeyAsId()
  async getCloudflareVideosForUserId(
    userId: string
  ): Promise<CloudflareVideo[]> {
    const res = await this.db.query(aql`
      FOR item in ${this.collection}
        FILTER item.userId == ${userId} && item.uploaded == true        
        RETURN item
    `)
    return await res.all()
  }
}
