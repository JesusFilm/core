import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { BucketService } from '../../../lib/bucket/bucketService';
import { GoogleOAuthService } from '../../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../../lib/prisma.service';
import { YoutubeService } from '../../../lib/youtube/youtubeService';
import { GoogleDriveService } from '../../google-drive/googleDriveService';
import { UpdateVideoCaption } from '../bullMQ.service';

@Processor('nexus-bucket')
export class UpdateCaption {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly bucketService: BucketService,
    private readonly youtubeService: YoutubeService,
    private readonly prismaService: PrismaService,
  ) {}

  @Process('processCaption')
  async process(job: Job<UpdateVideoCaption>): Promise<UpdateVideoCaption> {
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
    const localizedResource =
      await this.prismaService.resourceLocalization.findFirst({
        where: { resourceId: job.data.resource.id },
      });

    await this.prismaService.localizedResourceFile.update({
      where: { localizationId: localizedResource?.id },
      data: { captionFileCloudFlareId: bucketFile.Key },
    });

    const youtubeToken = await this.googleOAuthService.getNewAccessToken(
      job.data.channel.refreshToken,
    );

    const youtubeResponse = await this.youtubeService.uploadCaption({
      token: youtubeToken,
      videoId: job.data.resource.videoId,
      language: job.data.resource.language,
      name: '',
      captionFile: filePath,
      isDraft: false,
      mimeType: job.data.resource.mimeType
    });
    console.log('YOUTUBE RESPONSE UPLOAD CAPTION: ', youtubeResponse);
    await job.progress(100);
    return job.returnvalue;
  }
}
