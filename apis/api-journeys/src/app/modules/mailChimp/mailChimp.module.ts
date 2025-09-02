import { Global, Module } from '@nestjs/common'

import { MailChimpService } from './mailChimp.service'

@Global()
@Module({
  providers: [MailChimpService],
  exports: []
})
export class MailChimpModule {}
