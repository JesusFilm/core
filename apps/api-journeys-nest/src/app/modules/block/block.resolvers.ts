// import {
//     Args,
//     Mutation,
//     Query,
//     Resolver
//   } from '@nestjs/graphql';
  
//   import { BlockService } from './block.service';
//   import { Block, BlockInput } from './block.models';
  
  
//   @Resolver(of => Block)
//   export class BlockResolvers {
//     constructor(private readonly blockservice: BlockService) {}
  
//     @Query(returns => [Block])
//     async getBlocks() {
//       return await this.blockservice.getAll();
//     }
  
//     @Query(returns => Block)
//     async getBlockById(@Args('_id', {type: () => String }) _id: string) {
//       return await this.blockservice.getById(_id);
//     }
  
//     @Mutation(returns => Block)
//     async createBlock(@Args('block') block: BlockInput) {
//       const createdBlock = await this.blockservice.insertOne(block);
//       return createdBlock;
//     }
//   }