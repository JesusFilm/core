import { TreeBlock } from '../../../block'

interface BlockContext {
  blockId: string
  contextText: string
}

export function extractBlockContexts(
  blocks: TreeBlock[]
): BlockContext[] {
  const contexts: BlockContext[] = []

  for (const block of blocks) {
    const text = extractTextFromBlock(block)
    if (text.length > 0) {
      contexts.push({
        blockId: block.id,
        contextText: text
      })
    }

    if (block.children.length > 0) {
      const childContexts = extractBlockContexts(block.children)
      contexts.push(...childContexts)
    }
  }

  return contexts
}

function extractTextFromBlock(block: TreeBlock): string {
  switch (block.__typename) {
    case 'TypographyBlock':
      return 'content' in block ? String(block.content ?? '') : ''
    case 'ButtonBlock':
      return 'label' in block ? String(block.label ?? '') : ''
    case 'VideoBlock':
      return 'title' in block ? String(block.title ?? '') : ''
    default:
      return ''
  }
}
