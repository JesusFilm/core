import type { TreeBlock } from '@core/journeys/ui/block'

interface TypographyBlock {
  __typename: 'TypographyBlock'
  id: string
  content: string
  parentBlockId: string | null
  parentOrder: number | null
  children: TreeBlock[]
}

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
  if (!treeBlock) {
    return ''
  }

  const extractContent = (blocks: TreeBlock[]): string[] => {
    const contents: string[] = []
    
    for (const block of blocks) {
      if (block.__typename === 'TypographyBlock') {
        const typographyBlock = block as TypographyBlock
        if (typographyBlock.content && typographyBlock.content.trim()) {
          contents.push(typographyBlock.content.trim())
        }
      }
      
      // Recursively process children
      if (block.children && block.children.length > 0) {
        contents.push(...extractContent(block.children))
      }
    }
    
    return contents
  }

  const allContents = extractContent([treeBlock])
  const combinedContent = allContents.join(' ').trim()
  
  // Limit content length to prevent excessive context
  if (combinedContent.length <= maxLength) {
    return combinedContent
  }
  
  // Truncate to maxLength while trying to keep complete words
  const truncated = combinedContent.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...'
}
