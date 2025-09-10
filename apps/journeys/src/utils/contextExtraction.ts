import type { TreeBlock } from '@core/journeys/ui/block'

export interface BlockContext {
  id: string
  type: string
  parentOrder: number | null
  parentBlockId: string | null
  textContent: string
  children: BlockContext[]
}

function formatText(prefix: string, part: string): string {
  if (!part) {
    return ''
  }
  const partText = part.trim()
  if (!partText) {
    return ''
  }
  return `${prefix} ${partText}`
}

function formatTextResponseBlockParts(
  label: string | null | undefined,
  placeholder: string | null | undefined,
  hint: string | null | undefined
): string[] {
  return [
    formatText('Label:', label ?? ''),
    formatText('Placeholder:', placeholder ?? ''),
    formatText('Hint:', hint ?? '')
  ].filter(Boolean) // removes empty strings
}

const extractAllText = (block: TreeBlock): string[] => {
  let textContent = ''

  switch (block.__typename) {
    case 'TypographyBlock':
      textContent = formatText('[Typography]', block.content)
      break
    case 'ButtonBlock':
      textContent = formatText('[Button]', block.label)
      break
    case 'TextResponseBlock': {
      const parts: string[] = formatTextResponseBlockParts(
        block.label,
        block.placeholder,
        block.hint
      )
      textContent =
        parts.length > 0 ? formatText('[TextInput]', parts.join(' | ')) : ''
      break
    }
    case 'RadioOptionBlock':
      textContent = formatText('[RadioOption]', block.label)
      break
    default:
      textContent = ''
  }

  const texts = textContent ? [textContent] : []

  // Collect children's text recursively
  const childrenTexts = block.children?.flatMap(extractAllText) || []

  return [...texts, ...childrenTexts]
}

/**
 * Extracts text content from all relevant block types in the journey tree
 * @param treeBlock - Tree block from useBlocks hook
 * @returns Structured block context with text content from all relevant block types
 */
export function extractBlockContext(treeBlock: TreeBlock): string {
  if (!treeBlock) {
    return ''
  }

  const allTexts = extractAllText(treeBlock)
  const contextText = allTexts.join(' | ').trim()
  return contextText
}
