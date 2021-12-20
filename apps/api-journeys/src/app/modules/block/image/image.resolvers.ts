import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import {
  ImageBlock,
  ImageBlockCreateInput,
  ImageBlockUpdateInput
} from '../../../__generated__/graphql'
import { UserInputError } from 'apollo-server-errors'
import { IdAsKey } from '@core/nest/decorators'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { BlockService } from '../block.service'
import { encode } from 'blurhash'
import { createCanvas, loadImage, Image } from 'canvas'

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
  @UseGuards(GqlAuthGuard)
  @IdAsKey()
  async imageBlockCreate(
    @Args('input') input: ImageBlockCreateInput & { __typename }
  ): Promise<ImageBlock> {
    input.__typename = 'ImageBlock'
    const block = await handleImage(input)
    return await this.blockService.save(block)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async imageBlockUpdate(
    @Args('id') id: string,
    @Args('input') input: ImageBlockUpdateInput
  ): Promise<ImageBlock> {
    const block = await handleImage(input)
    return await this.blockService.update(id, block)
  }
}
