import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Resolver,
} from '@nestjs/graphql';
import { ImageBlock, ImageBlockCreateInput } from '../../../graphql';
import { UserInputError } from 'apollo-server-errors'
import { IdAsKey } from '../../../lib/decorators';
import { AuthGuard } from '../../auth/auth.guard';
import { BlockService } from '../block.service';
import { encode } from 'blurhash'
import { createCanvas, loadImage, Image } from 'canvas'

@Resolver('ImageBlock')
export class ImageBlockResolvers {
    constructor(private readonly blockservice: BlockService) { }
@Mutation()
  @IdAsKey()
  @UseGuards(new AuthGuard())
  async imageBlockCreate(
    @Args('input') input: ImageBlockCreateInput
  ): Promise<ImageBlock>{
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
      type: 'ImageBlock',        
      width: image.width,
      height: image.height,
      blurhash: blurhash
    }

    return await this.blockservice.save(block);
  }
}