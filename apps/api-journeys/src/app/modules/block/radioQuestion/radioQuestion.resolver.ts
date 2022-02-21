import { UseGuards } from '@nestjs/common'
import { Args, Mutation, ResolveField, Resolver, Parent } from '@nestjs/graphql'
import { IdAsKey, KeyAsId } from '@core/nest/decorators'
import {
  Action,
  RadioOptionBlock,
  RadioQuestionBlock,
  RadioOptionBlockCreateInput,
  RadioQuestionBlockCreateInput,
  UserJourneyRole,
  RadioOptionBlockUpdateInput,
  RadioQuestionBlockUpdateInput
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('RadioOptionBlock')
export class RadioOptionBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @ResolveField()
  action(@Parent() block: RadioOptionBlock): Action | null {
    if (block.action == null) return null

    return {
      ...block.action,
      parentBlockId: block.id
    }
  }

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async radioOptionBlockCreate(
    @Args('input') input: RadioOptionBlockCreateInput & { __typename }
  ): Promise<RadioOptionBlock> {
    input.__typename = 'RadioOptionBlock'
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...input,
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @KeyAsId()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async radioOptionBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: RadioOptionBlockUpdateInput
  ): Promise<RadioOptionBlock> {
    return await this.blockService.update(id, input)
  }
}

@Resolver('RadioQuestionBlock')
export class RadioQuestionBlockResolver {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async radioQuestionBlockCreate(
    @Args('input') input: RadioQuestionBlockCreateInput & { __typename }
  ): Promise<RadioQuestionBlock> {
    input.__typename = 'RadioQuestionBlock'
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...input,
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @KeyAsId()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async radioQuestionBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: RadioQuestionBlockUpdateInput
  ): Promise<RadioQuestionBlock> {
    return await this.blockService.update(id, input)
  }
}
