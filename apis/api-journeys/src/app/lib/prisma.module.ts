import { Global, Module } from '@nestjs/common'

import { PrismaService, prismaServiceProvider } from './prisma.service'

@Global()
@Module({
  providers: [prismaServiceProvider],
  exports: [PrismaService]
})
export class PrismaModule {}
