import { unlink } from 'fs'

import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { BucketService } from '../../bucket/bucket.service'
import { GoogleDriveService } from '../../google/drive.service'
import { GoogleOAuthService } from '../../google/oauth.service'
import { GoogleYoutubeService } from '../../google/youtube.service'
import { PrismaService } from '../../prisma.service'
import {
  UpdateVideoLocalizationJob,
  UploadResourceJob
} from '../bullMQ.service'

@Processor('nexus-batch-worker')
export class BatchJobWorker {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly bucketService: BucketService,
    private readonly youtubeService: GoogleYoutubeService,
    private readonly prismaService: PrismaService
  ) {}

  @Process('processResourceUpdate')
  async process(
    job: Job<UpdateVideoLocalizationJob>
  ): Promise<UploadResourceJob> {
    // DOWNLOAD THUMBNAIL FROM DRIVE
    let thumnbnailFilePath = ''
    if (job.data.resource?.thumbnailDriveId != null) {
      thumnbnailFilePath = await this.googleDriveService.downloadDriveFile({
        fileId: job.data.resource.thumbnailDriveId,
        accessToken: job.data.accessToken
      })

      if (thumnbnailFilePath !== '') {
        await this.youtubeService.updateVideoThumbnail({
          token: job.data.accessToken,
          videoId: job.data.localizations[0].videoId,
          mimeType: job.data.resource.thumbnailMimeType ?? '',
          thumbnailPath: thumnbnailFilePath
        })
      }
    }

    // UPDATE YOUTUBE DATA
    await this.youtubeService.updateVideo({
      token: job.data.accessToken,
      title: job.data.resource.title,
      description: job.data.resource.description,
      category: job.data.resource.category,
      privacyStatus: job.data.resource.privacyStatus,
      isMadeForKids: job.data.resource.isMadeForKids,
      videoId: job.data.localizations[0].videoId,
      localizations: job.data.localizations
    })

    await job.progress(100)
    return { ...job.returnvalue }
  }

  @Process('processResourceUpload')
  async processResourceUpload(
    job: Job<UploadResourceJob>
  ): Promise<UploadResourceJob> {
    // DOWNLOAD VIDEO FROM DRIVE
    const videoFilePath = await this.googleDriveService.downloadDriveFile(
      {
        fileId: job.data.resource.driveId,
        accessToken: job.data.accessToken
      },
      async (downloadProgress) => {
        await job.progress(0 + downloadProgress / 3)
        return await Promise.resolve()
      }
    )

    // DOWNLOAD THUMBNAIL FROM DRIVE
    let thumnbnailFilePath = ''
    if (job.data.resource?.thumbnailDriveId != null) {
      thumnbnailFilePath = await this.googleDriveService.downloadDriveFile({
        fileId: job.data.resource.thumbnailDriveId,
        accessToken: job.data.accessToken
      })
    }

    // UPLOAD VIDEO
    const youtubeData = await this.youtubeService.uploadVideo(
      {
        token: job.data.accessToken,
        filePath: videoFilePath,
        channelId: job.data.channel.channelId,
        title: job.data.resource.title ?? '',
        description: job.data.resource.description ?? '',
        defaultLanguage: job.data.resource.language ?? 'en',
        privacyStatus: job.data.resource.privacyStatus
      },
      async (progress) => {
        progress = 55 + progress / 3
        await job.progress(progress)
        return await Promise.resolve()
      }
    )

    await unlink(videoFilePath, () => {
      console.log('File removed')
    })

    // UPDATE THUMBNAIL
    if (
      job?.data?.resource?.thumbnailDriveId != null &&
      youtubeData?.data?.id != null
    ) {
      if (thumnbnailFilePath != null) {
        await this.youtubeService.updateVideoThumbnail({
          token: job.data.accessToken,
          videoId: youtubeData?.data?.id,
          thumbnailPath: thumnbnailFilePath,
          mimeType: job.data.resource.thumbnailMimeType ?? 'image/jpeg'
        })
      }
    }

    await this.prismaService.resourceChannel.create({
      data: {
        channelId: job.data.channel.id,
        resourceId: job.data.resource?.id,
      }
    })

    await this.prismaService.resourceLocalization.updateMany({
      where: {
        resourceId: job.data.resource?.id,
        language: job.data.resource?.language
      },
      data: {
        videoId: youtubeData.data.id ?? ''
      }
    })

    return {
      ...job.returnvalue,
      youtubeId: youtubeData.data.id ?? ''
    }
  }
}
