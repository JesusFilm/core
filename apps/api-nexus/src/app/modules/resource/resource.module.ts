import { Module } from '@nestjs/common'

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
    GoogleDriveService
  ]
})
export class ResourceModule {}
