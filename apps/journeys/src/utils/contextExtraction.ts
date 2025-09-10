import type { TreeBlock } from '@core/journeys/ui/block'

export interface BlockContext {
  id: string
  type: string
  parentOrder: number | null
  parentBlockId: string | null
  textContent: string
  children: BlockContext[]
}

/**
 * Extracts text content from all relevant block types in the journey tree
 * @param treeBlock - Tree block from useBlocks hook
 * @returns Structured block context with text content from all relevant block types
 */
export function extractBlockContext(treeBlock: TreeBlock): BlockContext {
  if (!treeBlock) {
    return {
      id: '',
      type: '',
      parentOrder: null,
      parentBlockId: null,
      textContent: '',
      children: []
    }
  }

  const extractBlockContent = (block: TreeBlock): BlockContext => {
    let textContent = ''

    // Extract text content based on block type
    switch (block.__typename) {
      case 'TypographyBlock':
        textContent = block.content?.trim()
          ? `[Typography] ${block.content.trim()}`
          : ''
        break
      case 'ButtonBlock':
        textContent = block.label?.trim()
          ? `[Button] ${block.label.trim()}`
          : ''
        break
      case 'TextResponseBlock': {
        // Concatenate label, placeholder, and hint into a single string with separators
        const parts: string[] = []
        if (block.label?.trim()) parts.push(`Label: ${block.label.trim()}`)
        if (block.placeholder?.trim())
          parts.push(`Placeholder: ${block.placeholder.trim()}`)
        if (block.hint?.trim()) parts.push(`Hint: ${block.hint.trim()}`)
        textContent = parts.length > 0 ? `[TextInput] ${parts.join(' | ')}` : ''
        break
      }
      case 'RadioOptionBlock':
        textContent = block.label?.trim()
          ? `[RadioOption] ${block.label.trim()}`
          : ''
        break
      default:
        textContent = ''
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
