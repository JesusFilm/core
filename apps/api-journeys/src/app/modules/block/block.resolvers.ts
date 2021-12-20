// Block resolver tests are in individual block type spec files

import {
  Args,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { Block } from '../../__generated__/graphql'
import { BlockMiddleware } from '../../lib/decorators'
import { KeyAsId } from '@core/nest/decorators'
import { BlockService } from './block.service'

@Resolver('Block')
export class BlockResolvers {
  constructor(private readonly blockService: BlockService) { }
  @ResolveField()
  __resolveType(obj: Block): string {
    return obj.type
  }

  @Query()
  @KeyAsId()
  @BlockMiddleware()
  async blocks(): Promise<Block[]> {
    return await this.blockService.getAll()
  }

  @Query()
  @KeyAsId()
  @BlockMiddleware()
  async block(@Args('id') _key: string): Promise<Block> {
    return await this.blockService.get(_key)
  }
}
