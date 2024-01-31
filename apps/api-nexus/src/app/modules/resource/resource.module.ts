import { Module } from '@nestjs/common';

import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService';
import { GoogleDriveService } from '../../lib/googleAPI/googleDriveService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';
import { BullMQModule } from '../bullMQ/bullMQ.module';

import { ResourceResolver } from './resource.resolver';

@Module({
  imports: [],
  providers: [
    ResourceResolver,
    PrismaService,
    GoogleOAuthService,
    GoogleDriveService,
    CloudFlareService,
    YoutubeService,
    BullMQModule,
  ],
})
export class ResourceModule {}
