import { UserInputError } from 'apollo-server-errors'
import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql'
import {
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockUpdateInput,
  VideoContent,
  VideoContentInput
} from '../../../__generated__/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { IdAsKey } from '@core/nest/decorators'
import { BlockService } from '../block.service'
import { UseGuards } from '@nestjs/common'
import { has } from 'lodash'

function checkVideoContentInput(input: VideoContentInput): boolean {
  return (
    has(input, ['src']) ||
    (has(input, ['mediaComponentId']) && has(input, ['languageId']))
  )
}
@Resolver('VideoContent')
export class VideoContentResolvers {
  @ResolveField()
  __resolveType(obj: VideoContent): string {
    if (has(obj, ['mediaComponentId'])) return 'VideoArclight'
    return 'VideoGeneric'
  }
}

@Resolver('VideoBlock')
export class VideoBlockResolvers {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()
  async videoBlockCreate(
    @Args('input') input: VideoBlockCreateInput & { __typename }
  ): Promise<VideoBlock> {
    input.__typename = 'VideoBlock'
    if (checkVideoContentInput(input?.videoContent))
      return await this.blockService.save(input)
    throw new UserInputError(
      'VideoContentInput requires src or mediaComponentId and languageId values'
    )
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async videoBlockUpdate(
    @Args('id') id: string,
    @Args('input') input: VideoBlockUpdateInput
  ): Promise<VideoBlock> {
    return await this.blockService.update(id, input)
  }
}
