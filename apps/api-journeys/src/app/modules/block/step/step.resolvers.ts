import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Resolver,
} from '@nestjs/graphql'
import { StepBlock, StepBlockCreatInput, StepBlockUpdateInput } from '../../../graphql'
import { IdAsKey } from '../../../lib/decorators'
import { AuthGuard } from '../../../lib/auth/auth.guard'
import { BlockService } from '../block.service'

@Resolver('StepBlock')
export class StepBlockResolvers {
  constructor(private readonly blockservice: BlockService) { }
  @Mutation()
  @IdAsKey()
  @UseGuards(new AuthGuard())
  async stepBlockCreate(@Args('input') input: StepBlockCreatInput): Promise<StepBlock> {
    input.type = 'StepBlock'
    return await this.blockservice.save(input)
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async stepBlockUpdate(@Args('id') id: string, @Args('input') input: StepBlockUpdateInput): Promise<StepBlock> {
    return await this.blockservice.update(id, input)
  }
}