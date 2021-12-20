import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Resolver,
} from '@nestjs/graphql'
import { StepBlock, StepBlockCreateInput, StepBlockUpdateInput } from '../../../__generated__/graphql'
import { IdAsKey } from '@core/nest/decorators'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { BlockService } from '../block.service'

@Resolver('StepBlock')
export class StepBlockResolvers {
  constructor(private readonly blockService: BlockService) { }
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()  
  async stepBlockCreate(@Args('input') input: StepBlockCreateInput & { __typename }): Promise<StepBlock> {
    input.__typename = 'StepBlock'
    return await this.blockService.save(input)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepBlockUpdate(@Args('id') id: string, @Args('input') input: StepBlockUpdateInput): Promise<StepBlock> {
    return await this.blockService.update(id, input)
  }
}