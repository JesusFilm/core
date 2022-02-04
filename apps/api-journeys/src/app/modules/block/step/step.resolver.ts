import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { IdAsKey, KeyAsId } from '@core/nest/decorators'
import {
  StepBlock,
  StepBlockCreateInput,
  StepBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('StepBlock')
export class StepBlockResolver {
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
    const siblings = await this.blockService.getSiblings(input.journeyId)
    return await this.blockService.save({
      ...input,
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async stepBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: StepBlockUpdateInput
  ): Promise<StepBlock> {
    return await this.blockService.update(id, input)
  }
}
