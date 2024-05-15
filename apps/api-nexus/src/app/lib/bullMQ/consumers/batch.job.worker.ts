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
    // GET VIDEO DRIVE TOKEN
    const channelToken = await this.googleOAuthService.getNewAccessToken(
      job.data.channel.refreshToken
    )

    const resp1 = await this.youtubeService.updateVideo({
      token: channelToken,
      title: job.data.localizations[0].title ?? '',
      description: job.data.localizations[0].description ?? '',
      category: job.data.resource.category,
      privacyStatus: job.data.resource.privacyStatus ?? 'private',
      isMadeForKids: job.data.resource.isMadeForKids ?? false,
      videoId: job.data.localizations[0].videoId,
      localizations: job.data.localizations
    })

    console.log('resp1', resp1)

    // DOWNLOAD VIDEO FROM DRIVE
    // console.log('DOWNLOAD FROM DRIVE: ', job.data.resource.driveId)
    // const videoFilePath = await this.googleDriveService.downloadDriveFile(
    //   { fileId: job.data.resource.driveId, accessToken: videoDriveToken },
    //   async (downloadProgress) => {
    //     await job.progress(0 + downloadProgress / 3)
    //     return await Promise.resolve()
    //   }
    // )

    // DOWNLOAD FROM DRIVE
    // console.log('UPLOADING FILE TO BUCKET: ', videoFilePath)
    // const bucketFile = await this.bucketService.uploadFile(
    //   videoFilePath,
    //   process.env.BUCKET_NAME ?? 'bucket-name',
    //   async (progress) => {
    //     progress = 30 + progress / 4
    //     await job.progress(progress)
    //     return await Promise.resolve()
    //   }
    // )

    // console.log('resource', job?.data?.resource)

    // UPLOAD VIDEO
    // console.log('UPLOAD TO YOUTUBE NOW', videoFilePath);
    // const youtubeData = await this.youtubeService.uploadVideo(
    //   {
    //     token: await this.googleOAuthService.getNewAccessToken(
    //       job.data.channel.refreshToken,
    //     ),
    //     filePath: videoFilePath,
    //     channelId: job.data.channel.channelId,
    //     title: job.data.resource.title ?? '',
    //     description: job.data.resource.description ?? '',
    //     defaultLanguage: job.data.resource.language ?? 'en',
    //     privacyStatus: job.data.resource.privacyStatus
    //   },
    //   async (progress) => {
    //     progress = 55 + progress / 3;
    //     await job.progress(progress);
    //     return await Promise.resolve();
    //   },
    // );

    // // UPLOAD THUMBNAIL
    // if (
    //   job?.data?.resource?.thumbnailDriveId != null &&
    //   youtubeData?.data?.id != null
    // ) {
    //   // GET THUMBNAIL DRIVE TOKEN
    //   const thumbnailDriveToken =
    //     await this.googleOAuthService.getNewAccessToken(
    //       job.data.resource.refreshToken,
    //     );

    //   if (thumbnailDriveToken != null) {
    //     // DOWNLOAD THUMBNAIL FROM DRIVE
    //     console.log(
    //       'DOWNLOAD THUMBNAIL FROM DRIVE: ',
    //       job.data.resource.thumbnailDriveId,
    //     );
    //     const thumnbnailFilePath =
    //       await this.googleDriveService.downloadDriveFile(
    //         {
    //           fileId: job.data.resource.thumbnailDriveId,
    //           accessToken: thumbnailDriveToken,
    //         },
    //         async (downloadProgress) => {
    //           downloadProgress = 90 + downloadProgress / 20;
    //           await job.progress(downloadProgress);
    //           return await Promise.resolve();
    //         },
    //       );
    //     const resp = await this.youtubeService.updateVideoThumbnail({
    //       token: await this.googleOAuthService.getNewAccessToken(
    //         job.data.channel.refreshToken,
    //       ),
    //       videoId: youtubeData?.data?.id,
    //       thumbnailPath: thumnbnailFilePath,
    //       mimeType: 'image/jpeg',
    //     });
    //     console.log('THUMBNAIL UPLOAD', resp);
    //   }
    // }

    // // UPLOAD CAPTION
    // if (
    //   job?.data?.resource?.captionDriveId != null &&
    //   youtubeData?.data?.id != null
    // ) {
    //   // GET THUMBNAIL DRIVE TOKEN
    //   const captionDriveToken = await this.googleOAuthService.getNewAccessToken(
    //     job.data.resource.refreshToken,
    //   );

    //   if (captionDriveToken != null) {
    //     // DOWNLOAD THUMBNAIL FROM DRIVE
    //     console.log(
    //       'DOWNLOAD THUMBNAIL FROM DRIVE: ',
    //       job.data.resource.thumbnailDriveId,
    //     );
    //     const captionFilePath = await this.googleDriveService.downloadDriveFile(
    //       {
    //         fileId: job.data.resource.captionDriveId,
    //         accessToken: captionDriveToken,
    //       },
    //       async (downloadProgress) => {
    //         downloadProgress = 95 + downloadProgress / 20;
    //           await job.progress(downloadProgress);
    //         return await Promise.resolve();
    //       },
    //     );
    //     const resp = await this.youtubeService.uploadCaption({
    //       token: await this.googleOAuthService.getNewAccessToken(
    //         job.data.channel.refreshToken,
    //       ),
    //       videoId: youtubeData?.data?.id,
    //       language: job.data.resource?.language ?? 'en',
    //       name: '',
    //       captionFile: captionFilePath,
    //       isDraft: false,
    //       mimeType: job.data.resource.captionDriveId,
    //     });
    //     console.log('THUMBNAIL UPLOAD', resp);
    //   }
    // }

    await job.progress(100)
    return { ...job.returnvalue }
    // return { ...job.returnvalue, youtubeId: youtubeData?.data?.id, bucketFileId: bucketFile.Key };
  }

  @Process('processResourceUpload')
  async processResourceUpload(
    job: Job<UploadResourceJob>
  ): Promise<UploadResourceJob> {
    // DOWNLOAD VIDEO FROM DRIVE
    const videoFilePath = await this.googleDriveService.downloadDriveFile(
      {
        fileId: job.data.resource.driveId,
        accessToken: await this.googleOAuthService.getNewAccessToken(
          job.data.resource.refreshToken
        )
      },
      async (downloadProgress) => {
        await job.progress(0 + downloadProgress / 3)
        return await Promise.resolve()
      }
    )

    // DOWNLOAD THUMBNAIL FROM DRIVE
    console.log(
      'DOWNLOAD THUMBNAIL FROM DRIVE: ',
      job.data?.resource?.thumbnailDriveId
    )
    let thumnbnailFilePath = ''
    if (job.data.resource?.thumbnailDriveId != null) {
      thumnbnailFilePath = await this.googleDriveService.downloadDriveFile({
        fileId: job.data.resource.thumbnailDriveId,
        accessToken: await this.googleOAuthService.getNewAccessToken(
          job.data.resource.refreshToken
        )
      })
    }

    // UPLOAD FILE TO BUCKET
    // console.log('UPLOADING FILE TO BUCKET: ', videoFilePath)
    const bucketFile = await this.bucketService.uploadFile(
      videoFilePath,
      process.env.BUCKET_NAME ?? 'bucket-name',
      async (progress) => {
        progress = 30 + progress / 4
        await job.progress(progress)
        return await Promise.resolve()
      }
    )

    // UPLOAD VIDEO
    // console.log('UPLOAD TO YOUTUBE NOW', videoFilePath)
    const youtubeData = { data: { id: null } }
    // const youtubeData = await this.youtubeService.uploadVideo(
    //   {
    //     token: await this.googleOAuthService.getNewAccessToken(
    //       job.data.channel.refreshToken
    //     ),
    //     filePath: videoFilePath,
    //     channelId: job.data.channel.channelId,
    //     title: job.data.resource.title ?? '',
    //     description: job.data.resource.description ?? '',
    //     defaultLanguage: job.data.resource.language ?? 'en',
    //     privacyStatus: job.data.resource.privacyStatus
    //   },
    //   async (progress) => {
    //     progress = 55 + progress / 3
    //     await job.progress(progress)
    //     return await Promise.resolve()
    //   }
    // )

    // UPDATE THUMBNAIL
    if (
      job?.data?.resource?.thumbnailDriveId != null &&
      youtubeData?.data?.id != null
    ) {
      if (thumnbnailFilePath != null) {
        await this.youtubeService.updateVideoThumbnail({
          token: await this.googleOAuthService.getNewAccessToken(
            job.data.channel.refreshToken
          ),
          videoId: youtubeData?.data?.id,
          thumbnailPath: thumnbnailFilePath,
          mimeType: 'image/jpeg'
        })
      }
    }

    // UPDATE Resource Channel
    await this.prismaService.resourceChannel.create({
      data: {
        channelId: job.data.channel.id,
        resourceId: job.data.resource?.id,
        youtubeId: youtubeData.data.id ?? ''
      }
    })

    await this.prismaService.resourceLocalization.updateMany({
     where: {resourceId: job.data.resource?.id, language: job.data.resource?.language},
      data: {
        videoId: youtubeData.data.id ?? ''
      }
    })

    return {
      ...job.returnvalue,
      bucketFileId: bucketFile.Key,
      youtubeId: youtubeData.data.id ?? ''
    }
  }
}
