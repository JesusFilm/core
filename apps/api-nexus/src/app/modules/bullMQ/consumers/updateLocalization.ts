import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { BucketService } from '../../../lib/bucket/bucketService';
import { GoogleOAuthService } from '../../../lib/googleOAuth/googleOAuth';
import { YoutubeService } from '../../../lib/youtube/youtubeService';
import { GoogleDriveService } from '../../google-drive/googleDriveService';
import { UpdateVideoLocalization } from '../bullMQ.service';

@Processor('nexus-bucket')
export class UpdateLocalization {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly bucketService: BucketService,
    private readonly youtubeService: YoutubeService,
  ) {}

  @Process('localizationprocess')
  async process(
    job: Job<UpdateVideoLocalization>,
  ): Promise<UpdateVideoLocalization> {
    const youtubeResponse =
      await this.youtubeService.addLocalizedMetadataAndUpdateTags(job.data);
    console.log('YOUTUBE RESPONSE ADD LOCALIZATION: ', youtubeResponse);
    await job.progress(100);
    return job.returnvalue;
  }
}
