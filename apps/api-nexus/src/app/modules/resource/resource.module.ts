import { Module } from '@nestjs/common'

import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService'
import { GoogleDriveService } from '../../lib/googleAPI/googleDriveService'
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth'
import { PrismaService } from '../../lib/prisma.service'

import { ResourceResolver } from './resource.resolver'

@Module({
  imports: [],
  providers: [
    ResourceResolver,
    PrismaService,
    GoogleOAuthService,
    GoogleDriveService,
    CloudFlareService
  ]
})
export class ResourceModule {}