import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { ResponseService } from '../../response/response.service'
import { VideoContentResolvers } from './video.resolvers'

@Module({
  imports: [DatabaseModule],
  providers: [VideoContentResolvers, ResponseService]
})
export class VideoModule { }
