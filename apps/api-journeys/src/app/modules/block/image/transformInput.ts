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
    const { data: pixels, info: metadata } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true })
    transformedInput.width = metadata.width
    transformedInput.height = metadata.height
    const data = new Uint8ClampedArray(pixels)
    transformedInput.blurhash = encode(
      data,
      transformedInput.width,
      transformedInput.height,
      4,
      4
    )
  } catch (ex) {
    throw new GraphQLError(ex.message, {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }

  return transformedInput
}
