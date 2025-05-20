import { Block } from '.prisma/api-journeys-modern-client'

export function getTextResponseBlockContent({
  block
}: {
  block: Block
}): string {
  let result = `
## Text Input:
- Block ID: ${block.id}
- Label: ${block.label}
- Input Placeholder Text: ${block.placeholder ?? ''}
- Required: ${block.required ?? false}
`
  if (block.submitLabel != null) {
    result += `### Submit Button :\n - Label: ${block.submitLabel}\n`
  }
  return result
}
