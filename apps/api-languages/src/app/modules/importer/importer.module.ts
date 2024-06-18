import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { ImporterVideosService } from './importerAudioPreviews/importerAudioPreviews'

@Module({
  providers: [PrismaService, ImporterVideosService],
  exports: [ImporterVideosService]
})
export class ImporterModule {}
