import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { BucketService } from '../../../lib/bucket/bucketService';
import { GoogleOAuthService } from '../../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../../lib/prisma.service';
import { YoutubeService } from '../../../lib/youtube/youtubeService';
import { GoogleDriveService } from '../../google-drive/googleDriveService';
import { UploadToBucketToYoutube } from '../bullMQ.service';

@Processor('nexus-bucket')
export class UploadToBucket {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly bucketService: BucketService,
    private readonly youtubeService: YoutubeService,
    private readonly prismaService: PrismaService,
  ) {}

  @Process('video_upload')
  async process(
    job: Job<UploadToBucketToYoutube>,
  ): Promise<UploadToBucketToYoutube> {
    console.log('BUCKET JOB DATA: ', job.data);
    const driveToken = await this.googleOAuthService.getNewAccessToken(
      job.data.resource.refreshToken,
    );
    console.log('DOWNLOADING: ', job.data.resource.driveId);
    const filePath = await this.googleDriveService.downloadDriveFile(
      { fileId: job.data.resource.driveId, accessToken: driveToken },
      async (downloadProgress) => {
        await job.progress(downloadProgress / 3);
        return await Promise.resolve();
      },
    );
    console.log('UPLOADING FILE: ', filePath);
    const bucketFile = await this.bucketService.uploadFile(
      filePath,
      process.env.BUCKET_NAME ?? 'bucket-name',
      async (progress) => {
        progress = 33 + progress / 3;
        await job.progress(progress);
        return await Promise.resolve();
      },
    );
    console.log('BUCKET FILE', bucketFile);
    await this.prismaService.resource.update({
      where: { id: job.data.resource.id },
      data: { googleDrive: { update: { cloudFlareId: bucketFile.Key } } },
    });

    const youtubeToken = await this.googleOAuthService.getNewAccessToken(
      job.data.channel.refreshToken,
    );

    const youtubeData = await this.youtubeService.uploadVideo(
      {
        token: youtubeToken,
        filePath,
        channelId: job.data.channel.channelId,
        title: job.data.resource.title ?? '',
        description: job.data.resource.description ?? '',
        defaultLanguage: job.data.resource.language ?? 'en',
      },
      async (progress) => {
        progress = 66 + progress / 3;
        await job.progress(progress);
        return await Promise.resolve();
      },
    );
    console.log('YOUTUBE DATA: ', youtubeData.data.id);
    if (youtubeData.data.id != null) {
      await this.prismaService.resourceYoutubeChannel.create({
        data: {
          resourceId: job.data.resource.id,
          channelId: job.data.channel.id,
          youtubeId: youtubeData.data.id,
        },
      });
    }
    await job.progress(100);
    return { ...job.returnvalue, youtubeId: youtubeData?.data?.id };
  }
}
