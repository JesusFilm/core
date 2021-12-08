import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Resolver,
} from '@nestjs/graphql'
import { StepBlock, StepBlockCreateInput, StepBlockUpdateInput } from '../../../graphql'
import { IdAsKey } from '@core/nest/decorators'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { BlockService } from '../block.service'

@Resolver('StepBlock')
export class StepBlockResolvers {
  constructor(private readonly blockservice: BlockService) { }
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()  
  async stepBlockCreate(@Args('input') input: StepBlockCreateInput): Promise<StepBlock> {
    input.type = 'StepBlock'
    return await this.blockservice.save(input)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepBlockUpdate(@Args('id') id: string, @Args('input') input: StepBlockUpdateInput): Promise<StepBlock> {
    return await this.blockservice.update(id, input)
  }
}