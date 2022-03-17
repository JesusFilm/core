import { Module } from '@nestjs/common'
import { TranslationResolver } from './translation.resolver'

@Module({
  providers: [TranslationResolver]
})
export class TranslationModule {}
