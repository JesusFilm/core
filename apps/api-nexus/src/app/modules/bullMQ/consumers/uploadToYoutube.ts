import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { UploadToBucketToYoutube } from '../bullMQ.service';

@Processor('nexus-youtube')
export class UploadToYoutube {
  @Process('process')
  async process(
    job: Job<UploadToBucketToYoutube>,
  ): Promise<UploadToBucketToYoutube> {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 1000; j++) {
        // console.log('PROGRESS ' + job.id.toString(), i, j);
      }
      progress += 1;

      await job.progress(progress);
    }
    return job.returnvalue;
  }
}
