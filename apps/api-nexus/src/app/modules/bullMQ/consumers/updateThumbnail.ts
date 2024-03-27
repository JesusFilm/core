import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { BucketService } from '../../../lib/bucket/bucketService';
import { GoogleOAuthService } from '../../../lib/googleOAuth/googleOAuth';
import { YoutubeService } from '../../../lib/youtube/youtubeService';
import { GoogleDriveService } from '../../google-drive/googleDriveService';
import { UpdateVideoThumbnail } from '../bullMQ.service';

@Processor('nexus-bucket')
export class UpdateThumbnail {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly bucketService: BucketService,
    private readonly youtubeService: YoutubeService,
  ) {}

  @Process('update_thumbnail')
  async process(
    job: Job<UpdateVideoThumbnail>,
  ): Promise<UpdateVideoThumbnail> {
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
    const youtubeToken = await this.googleOAuthService.getNewAccessToken(
      job.data.channel.refreshToken,
    );

    const youtubeResponse = await this.youtubeService.updateVideoThumbnail({
      token: youtubeToken,
      videoId: job.data.resource.videoId,
      thumbnailPath: filePath,
      mimeType: 'image/jpeg'
    });
    console.log('YOUTUBE RESPONSE UPDATE THUMBNAIL: ', youtubeResponse);
    await job.progress(100);
    return job.returnvalue;
  }
}
