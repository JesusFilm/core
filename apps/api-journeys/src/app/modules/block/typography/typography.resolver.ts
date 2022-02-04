import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { IdAsKey, KeyAsId } from '@core/nest/decorators'
import {
  TypographyBlock,
  TypographyBlockCreateInput,
  TypographyBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('TypographyBlock')
export class TypographyBlockResolver {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async typographyBlockCreate(
    @Args('input') input: TypographyBlockCreateInput & { __typename }
  ): Promise<TypographyBlock> {
    input.__typename = 'TypographyBlock'
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
  async typographyBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: TypographyBlockUpdateInput
  ): Promise<TypographyBlock> {
    return await this.blockService.update(id, input)
  }
}
