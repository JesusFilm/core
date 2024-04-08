/* eslint-disable @typescript-eslint/no-misused-promises */
import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { BucketService } from '../../../lib/bucket/bucketService';
import { GoogleOAuthService } from '../../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../../lib/prisma.service';
import { YoutubeService } from '../../../lib/youtube/youtubeService';
import { GoogleDriveService } from '../../google-drive/googleDriveService';
import { UploadToBucketToYoutube } from '../bullMQ.service';

@Injectable()
export class NexusJobListener implements OnModuleInit {
  constructor(
    @InjectQueue('nexus-bucket') private readonly uploadQueue: Queue,
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly bucketService: BucketService,
    private readonly youtubeService: YoutubeService,
  ) {}

  onModuleInit(): void {
    this.listenToProgressEvents();
    this.listenToCompletedEvents();
    this.listenToFailedEvents();
  }

  private listenToProgressEvents(): void {
    this.uploadQueue.on(
      'progress',
      async (job: Job<UploadToBucketToYoutube>, progress: number) => {
        console.log('Job Progress:', job.id, progress);
        void Promise.all([
          await this.prismaService.batchTask.update({
            data: {
              progress,
            },
            where: {
              id: job.data.batchTaskId,
            },
          }),
        ]);
      },
    );
  }

  private listenToCompletedEvents(): void {
    this.uploadQueue.on(
      'completed',
      async (job: Job<UploadToBucketToYoutube>) => {
        console.log('Job completed: ', job.id);
        console.log('Job: ', job);

        if (job.name === 'video_upload') {
          // const driveToken = await this.googleOAuthService.getNewAccessToken(
          //   job.data.resource.refreshToken,
          // );

          // const currentResource = await this.prismaService.resource.findFirst({
          //   where: {
          //     id: job.data.resource.id,
          //   },
          //   include: {
          //     thumbnailGoogleDrive: true,
          //     localizations: {
          //       include: {
          //         localizedResourceFile: true,
          //       },
          //     },
          //   },
          // });

          // const thumbnailDriveId =
          //   currentResource?.thumbnailGoogleDrive?.driveId;
          // const captionDriveId =
          //   currentResource?.localizations?.[0]?.localizedResourceFile
          //     ?.captionDriveId;
          // const captionLanguage = currentResource?.localizations?.[0]?.language;

          // Thumbnail
          // console.log('DOWNLOADING Thumbnail: ', thumbnailDriveId);
          // const thumbnailFilePath =
          //   await this.googleDriveService.downloadDriveFile(
          //     { fileId: thumbnailDriveId ?? '', accessToken: driveToken },
          //     async (progress) => {
          //       console.log(progress);
          //     },
          //   );

          // console.log('UPLOADING FILE: ', thumbnailFilePath);
          // const thumbnailBucketFile = await this.bucketService.uploadFile(
          //   thumbnailFilePath,
          //   process.env.BUCKET_NAME ?? 'bucket-name',
          //   async (progress) => {
          //     console.log(progress);
          //   },
          // );

          // Caption
          // console.log('DOWNLOADING Caption: ', captionDriveId);
          // const captionFilePath =
          //   await this.googleDriveService.downloadDriveFile(
          //     { fileId: captionDriveId ?? '', accessToken: driveToken },
          //     async (progress) => {
          //       console.log(progress);
          //     },
          //   );

          // console.log('UPLOADING FILE Caption: ', captionFilePath);
          // const captionBucketFile = await this.bucketService.uploadFile(
          //   captionFilePath,
          //   process.env.BUCKET_NAME ?? 'bucket-name',
          //   async (progress) => {
          //     console.log(progress);
          //   },
          // );

          // console.log('BUCKET FILE Thumbnail', thumbnailBucketFile);
          // console.log('BUCKET FILE Caption', captionBucketFile);

          // await this.prismaService.resource.update({
          //   where: { id: currentResource?.id },
          //   data: {
          //     thumbnailGoogleDrive: {
          //       update: { cloudFlareId: thumbnailBucketFile.Key },
          //     },
          //   },
          // });

          // const localizedResource =
          //   await this.prismaService.resourceLocalization.findFirst({
          //     where: { resourceId: currentResource?.id },
          //   });

          // const resourceFile =
          //   await this.prismaService.localizedResourceFile.update({
          //     where: { localizationId: localizedResource?.id },
          //     data: { captionFileCloudFlareId: captionBucketFile.Key },
          //   });

          // const youtubeToken = await this.googleOAuthService.getNewAccessToken(
          //   job.data.channel.refreshToken,
          // );

          // const youtubeThumnailResponse =
          //   await this.youtubeService.updateVideoThumbnail({
          //     token: youtubeToken,
          //     videoId: job.returnvalue.youtubeId,
          //     thumbnailPath: thumbnailFilePath,
          //     mimeType:
          //       currentResource?.thumbnailGoogleDrive?.mimeType ?? 'image/jpeg',
          //   });

          // const youtubeCaptionResponse =
          //   await this.youtubeService.uploadCaption({
          //     token: youtubeToken,
          //     videoId: job.returnvalue.youtubeId,
          //     language: captionLanguage ?? '',
          //     name: '',
          //     captionFile: captionFilePath,
          //     isDraft: false,
          //     mimeType: resourceFile.captionMimeType,
          //   });

          // console.log(
          //   'YOUTUBE RESPONSE UPDATE THUMBNAIL: ',
          //   youtubeThumnailResponse,
          // );
          // console.log(
          //   'YOUTUBE RESPONSE UPDATE CAPTION: ',
          //   youtubeCaptionResponse,
          // );

          void Promise.all([
            await this.prismaService.resource.update({
              data: { status: 'published' },
              where: { id: job.data.resource.id },
            }),
          ]);
        }

        void Promise.all([
          await this.prismaService.batchTask.update({
            data: {
              status: 'completed',
              progress: 100,
            },
            where: {
              id: job.data.batchTaskId,
            },
          }),
        ]);
      },
    );
  }

  private listenToFailedEvents(): void {
    this.uploadQueue.on('failed', async (job: Job<UploadToBucketToYoutube>) => {
      console.log('Job failed', job.id);
      console.log('Job:', job);

      await this.prismaService.batchTask.update({
        data: {
          status: 'failed',
          error: job.failedReason,
        },
        where: {
          id: job.data.batchTaskId,
        },
      });

      if (job.name === 'video_upload')
        await this.prismaService.resource.update({
          data: { status: 'error' },
          where: { id: job.data.resource.id },
        });
    });
  }
}
