import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import {
  StepBlock,
  StepBlockCreateInput,
  StepBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { IdAsKey } from '@core/nest/decorators'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('StepBlock')
export class StepBlockResolvers {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async stepBlockCreate(
    @Args('input') input: StepBlockCreateInput & { __typename }
  ): Promise<StepBlock> {
    input.__typename = 'StepBlock'
    return await this.blockService.save(input)
  }

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async stepBlockUpdate(
    @Args('id') id: string,
    @Args('input') input: StepBlockUpdateInput
  ): Promise<StepBlock> {
    return await this.blockService.update(id, input)
  }
}
