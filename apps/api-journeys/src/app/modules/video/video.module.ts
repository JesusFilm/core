import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ResponseService } from '../response/response.service';
import { VideoResolvers } from './video.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [VideoResolvers, ResponseService]
})
export class VideoModule { }
