import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module'
import { SignUpService } from './signup.service'
import { SignUpResolvers } from './signup.resolvers'
import { BlockService } from '../block/block.service'

@Module({
  imports: [DatabaseModule],
  providers: [SignUpService, SignUpResolvers, BlockService],
  exports: [SignUpService]
})
export class SignUpModule {}
