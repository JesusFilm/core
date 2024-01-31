import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { BucketService } from '../../../lib/bucket/bucketService';
import { GoogleDriveService } from '../../google-drive/googleDriveService';
import { UploadToBucketTask } from '../bullMQ.service';

@Processor('nexus-bucket')
export class UploadToBucket {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly bucketService: BucketService,
  ) {}

  @Process('process')
  async process(job: Job<UploadToBucketTask>): Promise<UploadToBucketTask> {
    const filePath = await this.googleDriveService.downloadDriveFile(
      job.data.driveId,
      job.data.refreshToken,
      async (progress) => {
        await job.progress(progress / 2);
        return await Promise.resolve();
      },
    );
    console.log('filePath', filePath);
    const bucketFile = await this.bucketService.uploadFile(
      filePath,
      'nexus',
      async (progress) => {
        await job.progress(49 + progress / 2);
      },
    );
    console.log('bucketFile', bucketFile);
    await job.progress(100);
    return job.returnvalue;
  }
}
