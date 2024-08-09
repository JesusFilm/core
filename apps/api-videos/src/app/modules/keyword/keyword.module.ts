import { Module } from '@nestjs/common'

import { KeywordResolver } from './keyword.resolver'

@Module({
  providers: [KeywordResolver]
})
export class KeywordModule {}
