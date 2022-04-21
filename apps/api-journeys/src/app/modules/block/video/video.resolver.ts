import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { BlockService } from '../block.service'
import {
  CardBlock,
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
    block: VideoBlock
  ): {
    __typename: 'Video'
    id: string
    primaryLanguageId?: string | null
  } | null {
    if (block.videoId == null || block.videoVariantLanguageId == null)
      return null

    return {
      __typename: 'Video',
      id: block.videoId,
      primaryLanguageId: block.videoVariantLanguageId
    }
  }
}
