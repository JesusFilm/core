import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { YoutubeService } from '../../../lib/youtube/youtubeService';
import { UpdateVideoLocalization } from '../bullMQ.service';

@Processor('nexus-bucket')
export class UpdateLocalization {
  constructor(private readonly youtubeService: YoutubeService) {}

  // @Process('processLocalization')
  // async process(
  //   job: Job<UpdateVideoLocalization>,
  // ): Promise<UpdateVideoLocalization> {
  //   console.log('LOCALIZATION JOB DATA: ', job.data);
  //   const youtubeResponse =
  //     await this.youtubeService.addLocalizedMetadataAndUpdateTags(job.data);
  //   console.log('YOUTUBE RESPONSE ADD LOCALIZATION: ');
  //   await job.progress(100);
  //   return job.returnvalue;
  // }

  // @Process('processLocalization')
  // async process(job: Job<UpdateVideoLocalization>): Promise<void> {
  //   console.log('LOCALIZATION JOB DATA: ', job.data);

  //   for (const localization of job.data.localizations) {
  //     await this.youtubeService.addLocalizedMetadataAndUpdateTags({
  //       batchId: job.data.batchId,
  //       videoId: job.data.videoId,
  //       channel: job.data.channel,
  //       localizations: [localization], // Wrap the single localization in an array
  //     });
  //   }

  //   await job.progress(100);
  // }

  @Process('processLocalization')
  async process(job: Job<UpdateVideoLocalization>): Promise<void> {
    console.log('LOCALIZATION JOB DATA: ', job.data);

    // Directly pass the entire array of localizations to the method
    await this.youtubeService.addLocalizedMetadataAndUpdateTags({
      batchId: job.data.batchId,
      videoId: job.data.videoId,
      channel: job.data.channel,
      localizations: job.data.localizations,
    });

    await job.progress(100);
  }
}
