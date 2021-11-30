import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference
} from '@nestjs/graphql';

import { BlockService } from './block.service';

@Resolver('Block')
export class BlockResolvers {
  constructor(private readonly blockservice: BlockService) { }
  @ResolveField()
  __resolveType(obj) {
    return obj.type;
  }
  // @Query(returns => [Block])
  // async blocks() {
  //   return await this.blockservice.getAll();
  // }

  // @Query(returns => Block)
  // async block(@Args('id', { type: () => ID }) _key: string) {
  //   return await this.blockservice.getByKey(_key);
  // }

  // @Mutation(returns => Block)
  // async createBlock(@Args('block') block: BlockInput) {
  //   return await this.blockservice.insertOne(block);
  // }
//   @ResolveReference()
//   resolveReference(reference: { __typename: string; id: string }) {
//     return this.blockservice.getByKey(reference.id);
//   }
}
