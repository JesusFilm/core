import { Module } from '@nestjs/common';

import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService';
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';
import { BatchModule } from '../batch/batch.module';
import { BatchService } from '../batch/batchService';
import { BullMQModule } from '../bullMQ/bullMQ.module';
import { GoogleDriveModule } from '../google-drive/googleDrive.module';
import { GoogleDriveService } from '../google-drive/googleDriveService';

import { ResourceResolver } from './resource.resolver';

@Module({
  imports: [GoogleDriveModule, BatchModule],
  providers: [
    ResourceResolver,
    PrismaService,
    GoogleOAuthService,
    GoogleDriveService,
    GoogleSheetsService,
    CloudFlareService,
    YoutubeService,
    BullMQModule,
    BatchService,
  ],
})
export class ResourceModule {}
