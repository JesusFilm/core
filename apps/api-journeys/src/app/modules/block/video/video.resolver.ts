import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { BlockService } from '../block.service'
import {
  UserJourneyRole,
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

@Resolver('VideoBlock')
export class VideoBlockResolver {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  async videoBlockCreate(
    @Args('input') input: VideoBlockCreateInput
  ): Promise<VideoBlock> {
    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )
    return await this.blockService.save({
      ...input,
      __typename: 'VideoBlock',
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async videoBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: VideoBlockUpdateInput
  ): Promise<VideoBlock> {
    return await this.blockService.update(id, input)
  }

  @ResolveField('video')
  video(
    @Parent()
    block: VideoBlock & { videoId: string; videoVariantLanguageId: string }
  ): {
    __typename: 'Video'
    id: string
    variant: {
      __typename: 'VideoVariant'
      language: {
        __typename: 'Language'
        id: string
      }
    }
  } {
    return {
      __typename: 'Video',
      id: block.videoId,
      variant: {
        __typename: 'VideoVariant',
        language: {
          __typename: 'Language',
          id: block.videoVariantLanguageId
        }
      }
    }
  }
}
