import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { IdAsKey } from '@core/nest/decorators'
import {
  RadioQuestionBlock,
  RadioOptionBlock,
  RadioQuestionBlockCreateInput,
  RadioOptionBlockCreateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../block.service'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('RadioOptionBlock')
export class RadioOptionBlockResolvers {
  constructor(private readonly blockService: BlockService) {}

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
    return await this.blockService.save(input)
  }
}

@Resolver('RadioQuestionBlock')
export class RadioQuestionBlockResolvers {
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
    return await this.blockService.save(input)
  }
}
