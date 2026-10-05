import { GraphQLError } from 'graphql'

import { transformInput } from '../../../block/image/transformInput'
import {
  TEXT_CAPS,
  assertHttpsUrl,
  assertLengthOrNull,
  badUserInput
} from '../../validation'

/** Every stored campaign image lives on Cloudflare Images (PRD §15). */
export const CAMPAIGN_IMAGE_HOST = 'imagedelivery.net'

export interface ImageInput {
  src?: string | null
  alt?: string | null
}

export interface ImageColumns {
  src?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

/**
 * `src`: https, and the host is `imagedelivery.net`. A pasted image URL on
 * another host is fetched into Cloudflare by the editor (api-media's
 * `createCloudflareUploadByUrl`) before it reaches this mutation, so the
 * stored address is always a Cloudflare one. `BAD_USER_INPUT` / `src`.
 */
export function assertImageSrc(src: string): string {
  const trimmed = src.trim()
  assertHttpsUrl(trimmed, 'src')
  if (new URL(trimmed).hostname !== CAMPAIGN_IMAGE_HOST)
    throw badUserInput(
      `src must be an https://${CAMPAIGN_IMAGE_HOST} image`,
      'src'
    )
  return trimmed
}

/**
 * Measure the image through the journey ImageBlock's transform: `width` and
 * `height` are read from the fetched bytes and the blurhash it also computes
 * is discarded (a campaign image has no blurhash column). A fetch failure is
 * `BAD_USER_INPUT` / `src`.
 */
export async function measureImage(
  src: string
): Promise<Pick<ImageColumns, 'width' | 'height'>> {
  try {
    const measured = await transformInput({
      src,
      width: null,
      height: null,
      blurhash: null
    })
    return { width: measured.width ?? null, height: measured.height ?? null }
  } catch (error) {
    throw badUserInput(
      error instanceof GraphQLError ? error.message : 'src could not be read',
      'src'
    )
  }
}

/**
 * The image body: `src` validated and measured when given (null clears the
 * image and its size); `alt` trimmed and capped at 500 (null allowed).
 * Omitted fields are left untouched.
 */
export async function validateImageInput(
  input: ImageInput
): Promise<ImageColumns> {
  const data: ImageColumns = {}
  if (input.src !== undefined) {
    if (input.src == null) {
      data.src = null
      data.width = null
      data.height = null
    } else {
      data.src = assertImageSrc(input.src)
      Object.assign(data, await measureImage(data.src))
    }
  }
  if (input.alt !== undefined)
    data.alt = assertLengthOrNull(input.alt, 'alt', TEXT_CAPS.imageAlt)
  return data
}
