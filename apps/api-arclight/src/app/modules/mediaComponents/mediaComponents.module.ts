import { Module } from '@nestjs/common'
import { MediaComponenentsController } from './mediaComponents.controller'

@Module({
  imports: [],
  controllers: [MediaComponenentsController],
  providers: []
})
export class MediaComponentsModule {}
