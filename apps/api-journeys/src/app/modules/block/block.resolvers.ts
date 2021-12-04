// Block resolver tests are in individual block type spec files

import {
  Args,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { Block } from '../../graphql'
import { BlockMiddleware, KeyAsId } from '../../lib/decorators'
import { BlockService } from './block.service'

@Resolver('Block')
export class BlockResolvers {
  constructor(private readonly blockservice: BlockService) { }
  @ResolveField()
  __resolveType(obj: Block): string {
    return obj.type
  }

  @Query()
  @KeyAsId()
  @BlockMiddleware()
  async blocks(): Promise<Block[]> {
    return await this.blockservice.getAll()
  }

  @Query()
  @KeyAsId()
  @BlockMiddleware()
  async block(@Args('id') _key: string): Promise<Block> {
    return await this.blockservice.get(_key)
  }
}
