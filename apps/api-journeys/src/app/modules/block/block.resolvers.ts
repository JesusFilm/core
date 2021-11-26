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
import { Block, ImageBlock } from './block.models';
import { Journey } from '../journey/journey.models';

@Resolver(of => Block)
export class BlockResolvers {
  constructor(private readonly blockservice: BlockService) { }
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

  // @ResolveField(of => Journey)
  // journey(@Parent() block: ImageBlock) {
  //   return { __typename: 'Journey', id: block.journeyId };
  // }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.blockservice.getByKey(reference.id);
  }
}
