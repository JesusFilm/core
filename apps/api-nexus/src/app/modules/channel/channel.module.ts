import { Module } from '@nestjs/common'

import { GoogleYoutubeService } from '../../lib/googleAPI/googleYoutubeService'
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth'
import { PrismaService } from '../../lib/prisma.service'

import { ChannelResolver } from './channel.resolver'

@Module({
  imports: [],
  providers: [
    ChannelResolver,
    PrismaService,
    GoogleOAuthService,
    GoogleYoutubeService
  ]
})
export class ChannelsModule {}