import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { object, string } from 'yup'
import { BlockService } from '../block.service'
import {
  Action,
  CardBlock,
  UserJourneyRole,
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

const videoBlockYouTubeSchema = object().shape({
  videoId: string().matches(
    /^[-\w]{11}$/,
    'videoId must be a valid YouTube videoId'
  )
})
const videoBlockInternalSchema = object().shape({
  videoId: string().required(),
  videoVariantLanguageId: string().required()
})

@Resolver('VideoBlock')
export class VideoBlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @ResolveField()
  action(@Parent() block: VideoBlock): Action | null {
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
  async videoBlockCreate(
    @Args('input') input: VideoBlockCreateInput
  ): Promise<VideoBlock> {
    switch (input.source) {
      case VideoBlockSource.youTube:
        await videoBlockYouTubeSchema.validate(input)
        break
      case VideoBlockSource.internal:
        await videoBlockInternalSchema.validate(input)
        break
    }

    if (input.isCover === true) {
      const coverBlock: VideoBlock = await this.blockService.save({
        ...input,
        __typename: 'VideoBlock',
        parentOrder: null
      })
      const parentBlock: CardBlock = await this.blockService.get(
        input.parentBlockId
      )

      await this.blockService.update(input.parentBlockId, {
        coverBlockId: coverBlock.id
      })

      if (parentBlock.coverBlockId != null) {
        await this.blockService.removeBlockAndChildren(
          parentBlock.coverBlockId,
          input.journeyId
        )
      }

      return coverBlock
    }

    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )

    const block: VideoBlock = await this.blockService.save({
      ...input,
      __typename: 'VideoBlock',
      parentOrder: siblings.length
    })

    const action = {
      parentBlockId: block.id,
      gtmEventName: 'NavigateAction',
      blockId: null,
      journeyId: null,
      url: null,
      target: null
    }

    return await this.blockService.update(block.id, { ...block, action })
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
    const block = await this.blockService.get<VideoBlock>(id)
    switch (input.source ?? block.source) {
      case VideoBlockSource.youTube:
        await videoBlockYouTubeSchema.validate({ ...block, ...input })
        break
      case VideoBlockSource.internal:
        await videoBlockInternalSchema.validate({ ...block, ...input })
        break
    }
    return await this.blockService.update(id, input)
  }

  @ResolveField('video')
  video(
    @Parent()
    block: VideoBlock
  ): {
    __typename: 'Video'
    id: string
    primaryLanguageId?: string | null
  } | null {
    if (
      block.videoId == null ||
      block.videoVariantLanguageId == null ||
      (block.source != null && block.source !== VideoBlockSource.internal)
    )
      return null

    return {
      __typename: 'Video',
      id: block.videoId,
      primaryLanguageId: block.videoVariantLanguageId
    }
  }

  @ResolveField('source')
  source(
    @Parent()
    block: VideoBlock
  ): VideoBlockSource {
    return block.source ?? VideoBlockSource.internal
  }
}
