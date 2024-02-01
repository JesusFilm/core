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

  @Process('process')
  async process(
    job: Job<UploadToBucketToYoutube>,
  ): Promise<UploadToBucketToYoutube> {
    console.log('UploadToBucket Job: ', job.id);
    const driveToken = await this.googleOAuthService.getNewAccessToken(
      job.data.resource.refreshToken,
    );
    console.log('Downloading: ', job.data.resource.driveId);
    const filePath = await this.googleDriveService.downloadDriveFile(
      { fileId: job.data.resource.driveId, accessToken: driveToken },
      async (downloadProgress) => {
        await job.progress(downloadProgress / 3);
        return await Promise.resolve();
      },
    );
    console.log('filePath', filePath);
    const bucketFile = await this.bucketService.uploadFile(
      filePath,
      'dev-api-media-core',
      async (progress) => {
        progress = 33 + progress / 3;
        await job.progress(progress);
        return await Promise.resolve();
      },
    );
    console.log('bucketFile', bucketFile);
    const youtubeToken = await this.googleOAuthService.getNewAccessToken(
      job.data.resource.refreshToken,
    );
    console.log('youtubeToken', youtubeToken);
    await this.youtubeService.uploadVideo(
      {
        token: youtubeToken,
        filePath,
        channelId: job.data.channel.channelId,
        title: 'test',
        description: 'test',
      },
      async (progress) => {
        progress = 66 + progress / 3;
        await job.progress(progress);
        return await Promise.resolve();
      },
    );
    await this.prismaService.resource.update({
      where: {
        id: job.data.resource.id,
      },
      data: {
        status: 'published',
      },
    });
    await job.progress(100);
    console.log('UploadToBucketToYoutube Job: ', job.id, 'completed');
    return job.returnvalue;
  }
}
