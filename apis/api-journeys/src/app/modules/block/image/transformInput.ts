import { encode } from 'blurhash'
import { GraphQLError } from 'graphql'
import fetch from 'node-fetch'
import sharp from 'sharp'

import { ImageBlockUpdateInput } from '../../../__generated__/graphql'

export async function transformInput<T extends ImageBlockUpdateInput>(
  input: T
): Promise<T> {
  if (
    (input.width ?? 0) > 0 &&
    (input.height ?? 0) > 0 &&
    (input.blurhash ?? '').length > 0
  )
    return input

  const transformedInput = {
    ...input,
    width: 0,
    height: 0,
    blurhash: ''
  }
  if (input.src == null) return transformedInput

  try {
    const response = await fetch(input.src)
    const buffer = await response.buffer()
    const image = sharp(buffer)
    const metadata = await image.metadata()
    transformedInput.width = metadata.width ?? 0
    transformedInput.height = metadata.height ?? 0
    const { data, info } = await image
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true })
    const pixels = new Uint8ClampedArray(data)
    transformedInput.blurhash = encode(pixels, info.width, info.height, 4, 4)
  } catch (ex) {
    if (ex instanceof Error) {
      throw new GraphQLError(ex.message, {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }
  }

  return transformedInput
}
