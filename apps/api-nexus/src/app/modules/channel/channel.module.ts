import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { GoogleOAuthService } from '../../lib/google/oauth.service'
import { GoogleYoutubeService } from '../../lib/google/youtube.service'
import { PrismaService } from '../../lib/prisma.service'

import { ChannelResolver } from './channel.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [
    ChannelResolver,
    PrismaService,
    GoogleOAuthService,
    GoogleYoutubeService
  ]
})
export class ChannelsModule {}
