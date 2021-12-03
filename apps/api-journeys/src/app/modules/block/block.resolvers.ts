import {
  Args,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Block } from '../../graphql';
import { KeyAsId } from '../../lib/decorators';
import { BlockService } from './block.service';

@Resolver('Block')
export class BlockResolvers {
  constructor(private readonly blockservice: BlockService) { }
  @ResolveField()
  __resolveType(obj: Block): string {
    return obj.type;
  }

  @Query()
  @KeyAsId()
  async blocks(): Promise<Block[]> {
    return await this.blockservice.getAll();
  }

  @Query()
  @KeyAsId()
  async block(@Args('id') _key: string): Promise<Block> {
    return await this.blockservice.get(_key);
  }
}
