import {
  JourneyFields_blocks as Block,
  JourneyFields_logoImageBlock as LogoImageBlock
} from '../JourneyProvider/__generated__/JourneyFields'

/**
 * Returns true if the journey has any customizable media: a customizable logo image block
 * or any ImageBlock/VideoBlock in blocks with customizable === true.
 */
export function checkBlocksForCustomizableMedia(
  blocks: Block[],
  logoImageBlock?: LogoImageBlock | null
): boolean {
  if (logoImageBlock?.customizable === true) return true

  for (const block of blocks) {
    if (block.__typename === 'ImageBlock' && block.customizable === true) return true
    if (block.__typename === 'VideoBlock' && block.customizable === true) return true
  }
  return false
}
