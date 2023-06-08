import { Global, Module } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { HostResolver } from './host.resolver'

@Global()
@Module({
  providers: [HostResolver, PrismaService],
  exports: [HostResolver]
})
export class HostModule {}
