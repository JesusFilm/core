import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module'
import { BlockService } from '../block/block.service'
import { ResponseService } from '../response/response.service'
import { SignUpResolvers } from './signup.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [ResponseService, BlockService, SignUpResolvers],
  exports: []
})
export class SignUpModule {}
