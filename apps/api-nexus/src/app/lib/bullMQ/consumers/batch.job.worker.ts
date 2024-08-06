import { unlink } from 'node:fs'

import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { FileService } from '../../file/file.service'
import { GoogleYoutubeService } from '../../google/youtube.service'
import { PrismaService } from '../../prisma.service'
import {
  UpdateVideoLocalizationJob,
  UploadResourceJob
} from '../bullMQ.service'

@Processor('nexus-batch-worker')
export class BatchJobWorker {
  constructor(
    private readonly fileService: FileService,
    private readonly youtubeService: GoogleYoutubeService,
    private readonly prismaService: PrismaService
  ) {}

  @Process('processResourceUpdate')
  async process(
    job: Job<UpdateVideoLocalizationJob>
  ): Promise<UploadResourceJob> {
    // DOWNLOAD THUMBNAIL
    let thumnbnailFilePath = ''
    if (job.data.resource?.thumbnailFileUrl != null) {
      thumnbnailFilePath = await this.fileService.downloadFile({
        fileUrl: job.data.resource.thumbnailFileUrl ?? ''
      })

      if (thumnbnailFilePath !== '') {
        if (job.data.localizations[0]?.videoId) {
          await this.youtubeService.updateVideoThumbnail({
            token: job.data.accessToken,
            videoId: job.data.localizations[0]?.videoId,
            mimeType: job.data.resource.thumbnailMimeType ?? 'image/jpeg',
            thumbnailPath: thumnbnailFilePath
          })
        }
      }
    }

    // UPDATE YOUTUBE DATA
    if (job.data.localizations[0].videoId) {
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
    }

    await job.progress(100)
    return { ...job.returnvalue }
  }

  @Process('processResourceUpload')
  async processResourceUpload(
    job: Job<UploadResourceJob>
  ): Promise<UploadResourceJob> {
    // DOWNLOAD VIDEO
    const videoFilePath = await this.fileService.downloadFile({
      fileUrl: job.data.resource.fileUrl,
      progressCallback: async (downloadProgress) => {
        await job.progress(0 + downloadProgress / 3)
        return Promise.resolve()
      }
    })

    // DOWNLOAD THUMBNAIL
    let thumnbnailFilePath = ''
    if (job.data.resource?.thumbnailFileUrl != null) {
      thumnbnailFilePath = await this.fileService.downloadFile({
        fileUrl: job.data.resource.thumbnailFileUrl ?? ''
      })
    }

    // DOWNLOAD CAPTION
    let captionFilePath = ''
    if (job.data.resource?.captionFileUrl != null) {
      captionFilePath = await this.fileService.downloadFile({
        fileUrl: job.data.resource.captionFileUrl ?? ''
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

    if (youtubeData?.data?.id != null) {
      // UPDATE THUMBNAIL
      if (job?.data?.resource?.thumbnailFileUrl != null) {
        if (thumnbnailFilePath != null) {
          await this.youtubeService.updateVideoThumbnail({
            token: job.data.accessToken,
            videoId: youtubeData?.data?.id,
            thumbnailPath: thumnbnailFilePath,
            mimeType: job.data.resource.thumbnailMimeType ?? 'image/jpeg'
          })
        }
      }

      // UPLOAD CAPTION
      if (job?.data?.resource?.captionFileUrl != null) {
        if (captionFilePath != null) {
          await this.youtubeService.uploadCaption({
            token: job.data.accessToken,
            videoId: youtubeData.data.id,
            language: job.data.resource.language ?? 'en',
            name: job.data.resource.language ?? 'en',
            captionFile: captionFilePath,
            isDraft: false,
            mimeType: job.data.resource.captionMimeType ?? 'text/vtt'
          })
        }
      }

      await this.prismaService.resourceChannel.create({
        data: {
          channelId: job.data.channel.id,
          resourceId: job.data.resource?.id,
          youtubeVideoId: youtubeData.data.id
        }
      })

      await this.prismaService.resourceLocalization.updateMany({
        where: {
          resourceId: job.data.resource?.id,
          language: job.data.resource?.language
        },
        data: {
          videoId: youtubeData.data.id
        }
      })
    }

    return {
      ...job.returnvalue,
      youtubeId: youtubeData.data.id ?? ''
    }
  }
}
