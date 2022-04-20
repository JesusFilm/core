import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UserInputError } from 'apollo-server-errors'
import { encode } from 'blurhash'
import axios from 'axios'
// eslint-disable-next-line import/no-namespace
import * as sharp from 'sharp'

import { BlockService } from '../block.service'
import {
  CardBlock,
  ImageBlock,
  ImageBlockCreateInput,
  ImageBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

async function handleImage(
  input
): Promise<ImageBlockCreateInput | ImageBlockUpdateInput> {
  const defaultBlock = {
    ...input,
    width: 0,
    height: 0,
    blurhash: ''
  }
  if (input.src == null) return defaultBlock

  try {
    const response = await axios.get(input.src, { responseType: 'arraybuffer' })
    const { data: pixels, info: metadata } = await sharp(response.data)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true })
    defaultBlock.width = metadata.width
    defaultBlock.height = metadata.height
    const data = new Uint8ClampedArray(pixels)
    defaultBlock.blurhash = encode(
      data,
      defaultBlock.width,
      defaultBlock.height,
      4,
      4
    )
  } catch (ex) {
    throw new UserInputError(ex.message, {
      argumentName: 'src'
    })
  }

  const block = {
    ...input,
    width: defaultBlock.width,
    height: defaultBlock.height,
    blurhash: defaultBlock.blurhash
  }

  return block
}
@Resolver('ImageBlock')
export class ImageBlockResolver {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  async imageBlockCreate(
    @Args('input') input: ImageBlockCreateInput
  ): Promise<ImageBlock> {
    const block = (await handleImage(input)) as ImageBlockCreateInput

    if (block.isCover === true) {
      const coverBlock: ImageBlock = await this.blockService.save({
        ...block,
        __typename: 'ImageBlock',
        parentOrder: null
      })
      const parentBlock: CardBlock = await this.blockService.get(
        block.parentBlockId
      )

      // Delete and replace existing coverBlock
      if (parentBlock.coverBlockId != null) {
        await this.blockService.removeBlockAndChildren(
          parentBlock.coverBlockId,
          parentBlock.journeyId
        )
      }
      await this.blockService.update(parentBlock.id, {
        coverBlockId: coverBlock.id
      })

      return coverBlock
    } else {
      const siblings = await this.blockService.getSiblings(
        block.journeyId,
        block.parentBlockId
      )
      return await this.blockService.save({
        ...block,
        __typename: 'ImageBlock',
        parentOrder: siblings.length
      })
    }
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async imageBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: ImageBlockUpdateInput
  ): Promise<ImageBlock> {
    const block = await handleImage(input)
    return await this.blockService.update(id, block)
  }
}
