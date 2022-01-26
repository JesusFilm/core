// Block resolver tests are in individual block type spec files

import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { KeyAsId } from '@core/nest/decorators'
import { Block } from '../../__generated__/graphql'
import { BlockService } from './block.service'

interface DbBlock extends Block {
  __typename: string
}
@Resolver('Block')
export class BlockResolvers {
  constructor(private readonly blockService: BlockService) {}
  @ResolveField()
  __resolveType(obj: DbBlock): string {
    return obj.__typename
  }

  @Query()
  @KeyAsId()
  async blocks(): Promise<Block[]> {
    return await this.blockService.getAll()
  }

  @Query()
  @KeyAsId()
  async block(@Args('id') _key: string): Promise<Block> {
    return await this.blockService.get(_key)
  }

  @Query()
  @KeyAsId()
  async siblings(@Args('id') _key: string): Promise<Block[]> {
    const block = await this.block(_key)
    return await this.blockService.getSiblings(
      block.journeyId,
      block.parentBlockId
    )
  }
}
