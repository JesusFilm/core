import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { BucketService } from '../../bucket/bucket.service'
import { GoogleDriveService } from '../../google/drive.service'
import { GoogleOAuthService } from '../../google/oauth.service'
import { UploadResourceJob } from '../bullMQ.service'

@Processor('nexus-batch-worker')
export class BatchJobWorker {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly bucketService: BucketService
  ) {}

  @Process('process')
  async process(job: Job<UploadResourceJob>): Promise<UploadResourceJob> {
    // GET VIDEO DRIVE TOKEN
    const videoDriveToken = await this.googleOAuthService.getNewAccessToken(
      job.data.resource.refreshToken
    )

    // DOWNLOAD VIDEO FROM DRIVE
    console.log('DOWNLOAD FROM DRIVE: ', job.data.resource.driveId)
    const videoFilePath = await this.googleDriveService.downloadDriveFile(
      { fileId: job.data.resource.driveId, accessToken: videoDriveToken },
      async (downloadProgress) => {
        await job.progress(0 + downloadProgress / 3)
        return await Promise.resolve()
      }
    )

    // DOWNLOAD FROM DRIVE
    console.log('UPLOADING FILE TO BUCKET: ', videoFilePath)
    const bucketFile = await this.bucketService.uploadFile(
      videoFilePath,
      process.env.BUCKET_NAME ?? 'bucket-name',
      async (progress) => {
        progress = 30 + progress / 4
        await job.progress(progress)
        return await Promise.resolve()
      }
    )

    console.log('resource', job?.data?.resource)

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
    return { ...job.returnvalue, bucketFileId: bucketFile.Key }
    // return { ...job.returnvalue, youtubeId: youtubeData?.data?.id, bucketFileId: bucketFile.Key };
  }
}
