import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { BucketService } from '../../bucket/bucketService'
import { GoogleDriveService } from '../../google/drive.service'
import { GoogleOAuthService } from '../../google/oauth.service'
import { YoutubeService } from '../../youtube/youtubeService'
import { UploadToBucketToYoutube } from '../bullMQ.service'

@Processor('nexus-bucket')
export class UploadToBucket {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly bucketService: BucketService,
    private readonly youtubeService: YoutubeService
  ) {}

  @Process('process')
  async process(
    job: Job<UploadToBucketToYoutube>
  ): Promise<UploadToBucketToYoutube> {
    const driveToken = await this.googleOAuthService.getNewAccessToken(
      job.data.resource.refreshToken
    )
    console.log('DOWNLOADING: ', job.data.resource.driveId)
    const filePath = await this.googleDriveService.downloadDriveFile(
      { fileId: job.data.resource.driveId, accessToken: driveToken },
      async (downloadProgress) => {
        await job.progress(downloadProgress / 3)
        return await Promise.resolve()
      }
    )
    console.log('UPLOADING FILE: ', filePath)
    const bucketFile = await this.bucketService.uploadFile(
      filePath,
      process.env.BUCKET_NAME ?? 'bucket-name',
      async (progress) => {
        progress = 33 + progress / 3
        await job.progress(progress)
        return await Promise.resolve()
      }
    )
    console.log('BUCKET FILE', bucketFile)
    const youtubeToken = await this.googleOAuthService.getNewAccessToken(
      job.data.channel.refreshToken
    )

    const youtubeData = await this.youtubeService.uploadVideo(
      {
        token: youtubeToken,
        filePath,
        channelId: job.data.channel.channelId,
        title: job.data.resource.title ?? '',
        description: job.data.resource.description ?? ''
      },
      async (progress) => {
        progress = 66 + progress / 3
        await job.progress(progress)
        return await Promise.resolve()
      }
    )
    console.log('YOUTUBE DATA: ', youtubeData)
    await job.progress(100)
    return job.returnvalue
  }
}
