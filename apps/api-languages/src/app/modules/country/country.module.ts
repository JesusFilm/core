import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { CountryResolver } from './country.resolver'

@Module({
  imports: [],
  providers: [CountryResolver, PrismaService],
  exports: []
})
export class CountryModule {}
