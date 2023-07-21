import { Global, Module } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { VisitorService } from './visitor.service'
import { VisitorResolver } from './visitor.resolver'

@Global()
@Module({
  imports: [],
  providers: [VisitorService, VisitorResolver, BlockService, PrismaService],
  exports: [VisitorService]
})
export class VisitorModule {}
