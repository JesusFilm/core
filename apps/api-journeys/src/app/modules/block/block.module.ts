import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { BlockService } from './block.service';
import { BlockResolvers } from './block.resolvers';

@Module({
  imports: [DatabaseModule],
  providers: [BlockService, BlockResolvers],
  exports: [BlockService],
})
export class BlockModule {
}
