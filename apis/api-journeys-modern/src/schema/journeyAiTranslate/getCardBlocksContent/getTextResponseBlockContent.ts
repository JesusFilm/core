import { Block } from '.prisma/api-journeys-modern-client'

export function getTextResponseBlockContent({
  blocks,
  block
}: {
  blocks: Block[]
  block: Block
}): string {
  let result = `
## Text Input:
- Block ID: ${block.id}
- Label: ${block.label}
- Input Placeholder Text: ${(block as any).placeholder ?? ''}
- Required: ${(block as any).required ?? false}
`
  if (block.submitLabel != null) {
    result += `### Submit Button :\n - Label: ${block.submitLabel}\n`
  }
  return result
}
