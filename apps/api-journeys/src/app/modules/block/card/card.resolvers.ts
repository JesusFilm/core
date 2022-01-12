import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { IdAsKey } from '@core/nest/decorators'
import {
  CardBlock,
  CardBlockCreateInput,
  CardBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('CardBlock')
export class CardBlockResolvers {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async cardBlockCreate(
    @Args('input') input: CardBlockCreateInput & { __typename }
  ): Promise<CardBlock> {
    input.__typename = 'CardBlock'
    return await this.blockService.save(input)
  }

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  async cardBlockUpdate(
    @Args('id') id: string,
    @Args('input') input: CardBlockUpdateInput
  ): Promise<CardBlock> {
    return await this.blockService.update(id, input)
  }
}
