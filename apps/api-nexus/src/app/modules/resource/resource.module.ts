import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { BullMQModule } from '../../lib/bullMQ/bullMQ.module'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService'
import { GoogleDriveService } from '../../lib/google/drive.service'
import { GoogleOAuthService } from '../../lib/google/oauth.service'
import { GoogleSheetsService } from '../../lib/google/sheets.service'
import { GoogleYoutubeService } from '../../lib/google/youtube.service'
import { PrismaService } from '../../lib/prisma.service'
import { BatchModule } from '../batch/batch.module'
import { BatchService } from '../batch/batch.service'

import { ResourceResolver } from './resource.resolver'

@Module({
  imports: [BatchModule, CaslAuthModule.register(AppCaslFactory)],
  providers: [
    ResourceResolver,
    PrismaService,
    GoogleOAuthService,
    GoogleDriveService,
    GoogleSheetsService,
    GoogleYoutubeService,
    CloudFlareService,
    BullMQModule,
    BatchService
  ]
})
export class ResourceModule {}
