import { UseGuards } from '@nestjs/common'
import { Args, Mutation, ResolveField, Resolver, Parent } from '@nestjs/graphql'
import { IdAsKey, KeyAsId } from '@core/nest/decorators'
import {
  Action,
  ButtonBlock,
  ButtonBlockCreateInput,
  ButtonBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('ButtonBlock')
export class ButtonBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @ResolveField()
  action(@Parent() block: ButtonBlock): Action | null {
    return block.action != null
      ? {
          ...block.action,
          parentBlockId: block.id
        }
      : null
  }

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async buttonBlockCreate(
    @Args('input') input: ButtonBlockCreateInput & { __typename }
  ): Promise<ButtonBlock> {
    input.__typename = 'ButtonBlock'
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
  async buttonBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: ButtonBlockUpdateInput
  ): Promise<ButtonBlock> {
    return await this.blockService.update(id, input)
  }
}
