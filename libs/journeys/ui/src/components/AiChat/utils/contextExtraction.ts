import { TreeBlock } from '../../../libs/block'

/**
 * Extracts text content from TypographyBlock nodes in the journey tree
 * @param treeBlocks - Array of tree blocks from useBlocks hook
 * @param maxLength - Maximum length of extracted context (default: 1000 characters)
 * @returns Concatenated text content from TypographyBlock nodes
 */
export function extractTypographyContent(
  treeBlock: TreeBlock,
  maxLength: number = 1000
): string {
  if (!treeBlock) return ''

  const extractContent = (blocks: TreeBlock[]): string[] => {
    return blocks.flatMap((block) => {
      const typographyContent =
        block.__typename === 'TypographyBlock' ? block.content.trim() : ''

      const childrenContent = block.children?.length
        ? extractContent(block.children)
        : []

      return typographyContent
        ? [typographyContent, ...childrenContent]
        : childrenContent
    })
  }

  const combinedContent = extractContent([treeBlock]).join(' ').trim()

  // Early return if content is within limit
  if (combinedContent.length <= maxLength) {
    return combinedContent
  }

  // Truncate to maxLength while preserving word boundaries
  const truncated = combinedContent.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  return lastSpaceIndex > 0
    ? `${truncated.substring(0, lastSpaceIndex)}...`
    : `${truncated}...`
}
