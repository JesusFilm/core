import {
    Args,
    ID,
    Mutation,
    Query,
    Resolver
  } from '@nestjs/graphql';

  import { BlockService } from './block.service';
  import { Block } from './block.models';

  @Resolver(of => Block)
  export class BlockResolvers {
    constructor(private readonly blockservice: BlockService) {}

    @Query(returns => [Block])
    async blocks() {
      return await this.blockservice.getAll();
    }
    
    @Query(returns => Block)
    async block(@Args('id', { type: () => ID }) _key: string) {
      return await this.blockservice.getByKey(_key);
    }

    // @Mutation(returns => Block)
    // async createBlock(@Args('block') block: BlockInput) {
    //   return await this.blockservice.insertOne(block);
    // }
  }
