import type { TreeBlock } from '@core/journeys/ui/block'

/**
 * Interface for block context extraction return type
 */
export interface BlockContext {
  id: string
  type: string
  parentOrder: number | null
  parentBlockId: string | null
  textContent: string | { label: string; placeholder?: string; hint?: string } | null
  children: BlockContext[]
}

/**
 * Extracts text content from all relevant block types in the journey tree
 * @param treeBlock - Tree block from useBlocks hook
 * @param maxLength - Maximum length of extracted context (default: 1000 characters)
 * @returns Structured block context with text content from all relevant block types
 */
export function extractBlockContext(
  treeBlock: TreeBlock,
  maxLength: number = 1000
): BlockContext {
  if (!treeBlock) {
    return {
      id: '',
      type: '',
      parentOrder: null,
      parentBlockId: null,
      textContent: null,
      children: []
    }
  }

  const extractBlockContent = (block: TreeBlock): BlockContext => {
    let textContent: string | { label: string; placeholder?: string; hint?: string } | null = null

    // Extract text content based on block type
    switch (block.__typename) {
      case 'TypographyBlock':
        textContent = block.content?.trim() || null
        break
      case 'ButtonBlock':
        textContent = block.label?.trim() || null
        break
      case 'TextResponseBlock':
        if (block.label || block.placeholder || block.hint) {
          textContent = {
            label: block.label?.trim() || '',
            ...(block.placeholder && { placeholder: block.placeholder.trim() }),
            ...(block.hint && { hint: block.hint.trim() })
          }
        }
        break
      case 'RadioOptionBlock':
        textContent = block.label?.trim() || null
        break
      case 'SignUpBlock':
        textContent = block.submitLabel?.trim() || null
        break
      default:
        textContent = null
    }

    // Process children recursively
    const children = block.children?.map(extractBlockContent) || []

    return {
      id: block.id,
      type: block.__typename,
      parentOrder: block.parentOrder,
      parentBlockId: block.parentBlockId,
      textContent,
      children
    }
  }

  return extractBlockContent(treeBlock)
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use extractBlockContext instead
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
