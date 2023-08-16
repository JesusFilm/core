import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { LanguageResolver } from './language.resolver'

@Module({
  imports: [CacheModule.register()],
  providers: [LanguageResolver, PrismaService],
  exports: []
})
export class LanguageModule {}
