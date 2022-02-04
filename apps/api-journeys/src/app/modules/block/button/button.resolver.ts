import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { KeyAsId } from '@core/nest/decorators'
import {
  ButtonBlock,
  ButtonBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('ButtonBlock')
export class ButtonBlockResolver {
  constructor(private readonly blockService: BlockService) {}
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
