import { Global, Module } from '@nestjs/common'
import { HostResolver } from './host.resolver'

@Global()
@Module({
  providers: [HostResolver],
  exports: [HostResolver]
})
export class HostModule {}
