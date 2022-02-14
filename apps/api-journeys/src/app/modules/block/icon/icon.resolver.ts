import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { KeyAsId, IdAsKey } from '@core/nest/decorators'
import {
  IconBlock,
  IconBlockCreateInput,
  IconBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('IconBlock')
export class IconBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @IdAsKey()
  async iconBlockCreate(
    @Args('input') input: IconBlockCreateInput & { __typename }
  ): Promise<IconBlock> {
    input.__typename = 'IconBlock'
    return await this.blockService.save({
      ...input,
      // Icons positions are set via parent block props, cannot be ordered.
      parentOrder: null
    })
  }

  @Mutation()
  @KeyAsId()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async iconBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: IconBlockUpdateInput
  ): Promise<IconBlock> {
    return await this.blockService.update(id, input)
  }
}
