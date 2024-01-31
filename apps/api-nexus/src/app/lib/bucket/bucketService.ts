import { readFileSync } from 'fs';
import { basename } from 'path';

import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class BucketService {
  async uploadFile(
    filePath: string,
    bucketName: string,
    progressCallback?: (progress: number) => Promise<void>,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const s3 = new S3({
      accessKeyId: process.env.BUCKET_ACCESS_KEY,
      secretAccessKey: process.env.BUCKET_SECRET_KEY,
      region: process.env.BUCKET_REGION,
      endpoint: process.env.BUCKET_ENDPOINT,
    });

    const fileContent = readFileSync(filePath);
    const params = {
      Bucket: bucketName,
      Key: basename(filePath),
      Body: fileContent,
    };
    const bucketFile = s3.upload(params);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bucketFile.on('httpUploadProgress', async (progress) => {
      if (progressCallback != null) {
        await progressCallback(progress.loaded / progress.total);
      }
      console.log(`Uploaded ${progress.loaded} of ${progress.total} bytes`);
    });
    return await bucketFile.promise();
  }
}
