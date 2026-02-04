import { Module } from '@nestjs/common'

import { TranslationResolver } from './translation.resolver'

@Module({
  providers: [TranslationResolver]
})
export default class TranslationModule {}
