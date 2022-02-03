import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UserInputError } from 'apollo-server-errors'
import { IdAsKey, KeyAsId } from '@core/nest/decorators'
import { encode } from 'blurhash'
import { createCanvas, loadImage, Image } from 'canvas'
import { BlockService } from '../block.service'
import {
  ImageBlock,
  ImageBlockCreateInput,
  ImageBlockUpdateInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

const getImageData = (image: Image): ImageData => {
  const canvas = createCanvas(image.width, image.height)
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, image.width, image.height)
}

const encodeImageToBlurhash = (image: Image): string => {
  const imageData = getImageData(image)
  return encode(imageData.data, imageData.width, imageData.height, 4, 4)
}

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

  let image: Image
  try {
    image = await loadImage(input.src)
  } catch (ex) {
    throw new UserInputError(ex.message, {
      argumentName: 'src'
    })
  }
  const blurhash = encodeImageToBlurhash(image)

  const block = {
    ...input,
    width: image.width,
    height: image.height,
    blurhash: blurhash
  }

  return block
}
@Resolver('ImageBlock')
export class ImageBlockResolvers {
  constructor(private readonly blockService: BlockService) {}
  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor
    ])
  )
  @IdAsKey()
  async imageBlockCreate(
    @Args('input') input: ImageBlockCreateInput & { __typename }
  ): Promise<ImageBlock> {
    input.__typename = 'ImageBlock'
    const block = (await handleImage(input)) as ImageBlockCreateInput
    const siblings = await this.blockService.getSiblings(
      block.journeyId,
      block.parentBlockId
    )
    return await this.blockService.save({
      ...block,
      parentOrder: siblings.length
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  @KeyAsId()
  async imageBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: ImageBlockUpdateInput
  ): Promise<ImageBlock> {
    const block = await handleImage(input)
    return await this.blockService.update(id, block)
  }
}
