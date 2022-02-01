import { UserInputError } from 'apollo-server-errors'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { IdAsKey, KeyAsId } from '@core/nest/decorators'
import { UseGuards } from '@nestjs/common'
import { has } from 'lodash'
import { BlockService } from '../block.service'
import {
  UserJourneyRole,
  VideoArclight,
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockUpdateInput,
  VideoContent,
  VideoContentInput
} from '../../../__generated__/graphql'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

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

@Resolver('VideoArclight')
export class VideoArclightResolvers {
  @ResolveField()
  src(@Parent() obj: VideoArclight): string {
    return `https://arc.gt/hls/${obj.mediaComponentId}/${obj.languageId}`
  }
}

@Resolver('VideoBlock')
export class VideoBlockResolvers {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async videoBlockCreate(
    @Args('input') input: VideoBlockCreateInput & { __typename }
  ): Promise<VideoBlock> {
    input.__typename = 'VideoBlock'
    if (checkVideoContentInput(input?.videoContent)) {
      const siblings = await this.blockService.getSiblings(
        input.journeyId,
        input.parentBlockId
      )
      return await this.blockService.save({
        ...input,
        parentOrder: siblings.length
      })
    }
    throw new UserInputError(
      'VideoContentInput requires src or mediaComponentId and languageId values'
    )
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async videoBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: VideoBlockUpdateInput
  ): Promise<VideoBlock> {
    return await this.blockService.update(id, input)
  }
}
